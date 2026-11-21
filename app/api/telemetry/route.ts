import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function db(){const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL is not configured");return neon(url)}
export async function POST(req:NextRequest){
 const secret=process.env.DEVICE_API_KEY;
 if(!secret||req.headers.get("x-device-key")!==secret)return NextResponse.json({error:"Unauthorized device"},{status:401});
 let body:unknown;try{body=await req.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 const v=body as Record<string,unknown>;
 const deviceId=typeof v.deviceId==="string"?v.deviceId.trim():"";
 const level=Number(v.levelPercent),distance=v.distanceCm==null?null:Number(v.distanceCm),temp=v.temperatureC==null?null:Number(v.temperatureC);
 if(!/^[a-zA-Z0-9_-]{2,64}$/.test(deviceId)||!Number.isFinite(level)||level<0||level>100||(distance!==null&&(!Number.isFinite(distance)||distance<0||distance>10000))||(temp!==null&&(!Number.isFinite(temp)||temp< -20||temp>100)))return NextResponse.json({error:"Invalid telemetry payload"},{status:400});
 try{const sql=db();const rows=await sql`INSERT INTO telemetry (device_id,level_percent,distance_cm,temperature_c) SELECT id,${level},${distance},${temp} FROM tanks WHERE id=${deviceId} RETURNING id,device_id,level_percent,distance_cm,temperature_c,recorded_at`;if(!rows.length)return NextResponse.json({error:"Unknown device. Register tank in database first."},{status:404});return NextResponse.json({ok:true,reading:rows[0]},{status:201})}catch{return NextResponse.json({error:"Database unavailable"},{status:503})}
}
export async function GET(req:NextRequest){
 const deviceId=req.nextUrl.searchParams.get("deviceId")||"tank-001";
 if(!/^[a-zA-Z0-9_-]{2,64}$/.test(deviceId))return NextResponse.json({error:"Invalid deviceId"},{status:400});
 try{
  const sql=db();
  const tanks=await sql`SELECT id,name,capacity_liters FROM tanks WHERE id=${deviceId} LIMIT 1`;
  if(!tanks.length)return NextResponse.json({error:"Tank not found"},{status:404});
  const readings=await sql`SELECT device_id,level_percent,distance_cm,temperature_c,recorded_at FROM telemetry WHERE device_id=${deviceId} ORDER BY recorded_at DESC LIMIT 1`;
  const history=await sql`SELECT level_percent,recorded_at FROM telemetry WHERE device_id=${deviceId} AND recorded_at >= NOW()-INTERVAL '24 hours' ORDER BY recorded_at ASC LIMIT 48`;
  return NextResponse.json({tank:tanks[0],reading:readings[0]??null,history},{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch{return NextResponse.json({error:"Database unavailable"},{status:503})}
}
