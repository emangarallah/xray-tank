import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {auth} from "@/lib/auth/server";
export const runtime="nodejs";export const dynamic="force-dynamic";
function db(){const u=process.env.DATABASE_URL;if(!u)throw new Error("DATABASE_URL missing");return neon(u)}
export async function POST(req:NextRequest){
 const deviceKey=req.headers.get("x-device-key")||"";if(deviceKey.length<32||deviceKey.length>128)return NextResponse.json({error:"Unauthorized device"},{status:401});
 let b:unknown;try{b=await req.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 const v=b as Record<string,unknown>;const id=typeof v.deviceId==="string"?v.deviceId.trim():"";const level=Number(v.levelPercent);const distance=v.distanceCm==null?null:Number(v.distanceCm);const temp=v.temperatureC==null?null:Number(v.temperatureC);
 if(!/^[a-zA-Z0-9_-]{2,64}$/.test(id)||!Number.isFinite(level)||level<0||level>100||(distance!==null&&(!Number.isFinite(distance)||distance<0||distance>10000))||(temp!==null&&(!Number.isFinite(temp)||temp< -20||temp>100)))return NextResponse.json({error:"Invalid telemetry payload"},{status:400});
 try{const sql=db();const hash=createHash("sha256").update(deviceKey).digest("hex");const rows=await sql`INSERT INTO telemetry(device_id,level_percent,distance_cm,temperature_c) SELECT id,${level},${distance},${temp} FROM tanks WHERE id=${id} AND device_key_hash=${hash} RETURNING id,device_id,level_percent,distance_cm,temperature_c,recorded_at`;if(!rows.length)return NextResponse.json({error:"Invalid device credentials or unregistered device"},{status:401});return NextResponse.json({ok:true,reading:rows[0]},{status:201})}catch{return NextResponse.json({error:"Database unavailable"},{status:503})}}
export async function GET(req:NextRequest){
 const {data}=await auth.getSession();const user=data?.user;if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
 const id=req.nextUrl.searchParams.get("deviceId")||"";if(!/^[a-zA-Z0-9_-]{2,64}$/.test(id))return NextResponse.json({error:"Invalid deviceId"},{status:400});
 try{const sql=db();const tanks=await sql`SELECT id,name,capacity_liters FROM tanks WHERE id=${id} AND owner_id=${user.id} LIMIT 1`;if(!tanks.length)return NextResponse.json({error:"Tank not found"},{status:404});
 const readings=await sql`SELECT device_id,level_percent,distance_cm,temperature_c,recorded_at FROM telemetry WHERE device_id=${id} ORDER BY recorded_at DESC LIMIT 1`;
 const history=await sql`SELECT level_percent,recorded_at FROM telemetry WHERE device_id=${id} AND recorded_at>=NOW()-INTERVAL '24 hours' ORDER BY recorded_at ASC LIMIT 48`;
 return NextResponse.json({tank:tanks[0],reading:readings[0]??null,history},{headers:{"Cache-Control":"no-store, max-age=0"}})}catch{return NextResponse.json({error:"Database unavailable"},{status:503})}}
