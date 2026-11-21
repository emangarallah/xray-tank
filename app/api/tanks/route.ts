import {NextRequest,NextResponse} from "next/server";
import {createHash,randomBytes,randomUUID} from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {auth} from "@/lib/auth/server";
export const runtime="nodejs";export const dynamic="force-dynamic";
function db(){const u=process.env.DATABASE_URL;if(!u)throw new Error("DATABASE_URL missing");return neon(u)}
export async function GET(){const {data}=await auth.getSession();const user=data?.user;if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
 try{const sql=db();const rows=await sql`SELECT id,name,capacity_liters,created_at FROM tanks WHERE owner_id=${user.id} ORDER BY created_at DESC`;return NextResponse.json({tanks:rows},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Database unavailable"},{status:503})}}
export async function POST(req:NextRequest){const {data}=await auth.getSession();const user=data?.user;if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
 let b:unknown;try{b=await req.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 const v=b as Record<string,unknown>;const name=typeof v.name==="string"?v.name.trim().slice(0,80):"";const capacity=Number(v.capacityLiters);
 if(!name||!Number.isFinite(capacity)||capacity<10||capacity>10000000)return NextResponse.json({error:"Enter tank name and capacity from 10 to 10,000,000 liters."},{status:400});
 try{const id="tank_"+randomUUID().replace(/-/g,"").slice(0,16);const deviceKey=randomBytes(32).toString("base64url");const keyHash=createHash("sha256").update(deviceKey).digest("hex");const sql=db();
 const rows=await sql`INSERT INTO tanks(id,name,capacity_liters,owner_id,device_key_hash) VALUES(${id},${name},${capacity},${user.id},${keyHash}) RETURNING id,name,capacity_liters,created_at`;
 return NextResponse.json({tank:rows[0],deviceKey},{status:201})}catch{return NextResponse.json({error:"Could not create tank"},{status:503})}}
