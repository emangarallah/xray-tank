import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
 const result={ok:false,service:"xray-tank-api",databaseConfigured:Boolean(process.env.DATABASE_URL),deviceKeyConfigured:Boolean(process.env.DEVICE_API_KEY),database:"unavailable" as "connected"|"unavailable"};
 if(!process.env.DATABASE_URL)return NextResponse.json(result,{status:503});
 try{const sql=neon(process.env.DATABASE_URL);await sql`SELECT 1`;result.ok=true;result.database="connected";return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json(result,{status:503,headers:{"Cache-Control":"no-store"}})}
}
