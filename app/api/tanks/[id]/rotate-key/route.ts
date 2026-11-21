import {NextResponse} from "next/server";
import {createHash,randomBytes} from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {auth} from "@/lib/auth/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(_req:Request,context:{params:Promise<{id:string}>}){
 const {data}=await auth.getSession();const user=data?.user;if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
 const {id}=await context.params;if(!/^[a-zA-Z0-9_-]{2,64}$/.test(id))return NextResponse.json({error:"Invalid tank ID"},{status:400});
 const url=process.env.DATABASE_URL;if(!url)return NextResponse.json({error:"Database unavailable"},{status:503});
 try{const deviceKey=randomBytes(32).toString("base64url");const hash=createHash("sha256").update(deviceKey).digest("hex");const sql=neon(url);
 const rows=await sql`UPDATE tanks SET device_key_hash=${hash} WHERE id=${id} AND owner_id=${user.id} RETURNING id`;
 if(!rows.length)return NextResponse.json({error:"Tank not found"},{status:404});
 return NextResponse.json({ok:true,deviceKey},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Could not rotate device key"},{status:503})}
}
