import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
 const result={ok:false,service:"xray-tank-api",databaseConfigured:Boolean(process.env.DATABASE_URL),authConfigured:Boolean(process.env.NEON_AUTH_BASE_URL&&process.env.NEON_AUTH_COOKIE_SECRET),deviceAuthentication:"per-tank-key",database:"unavailable" as "connected"|"unavailable"};
 if(!process.env.DATABASE_URL||!result.authConfigured)return NextResponse.json(result,{status:503,headers:{"Cache-Control":"no-store"}});
 try{const sql=neon(process.env.DATABASE_URL);await sql`SELECT id,owner_id,device_key_hash FROM tanks LIMIT 0`;result.ok=true;result.database="connected";return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json(result,{status:503,headers:{"Cache-Control":"no-store"}})}
}
