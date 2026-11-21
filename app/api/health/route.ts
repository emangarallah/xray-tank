import {NextResponse} from "next/server";
export async function GET(){return NextResponse.json({ok:true,service:"xray-tank-api",databaseConfigured:Boolean(process.env.DATABASE_URL),deviceKeyConfigured:Boolean(process.env.DEVICE_API_KEY)})}
