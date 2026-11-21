"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {authClient} from "@/lib/auth/client";
export default function AccountMenu(){const router=useRouter();const [email,setEmail]=useState<string|null>(null);
 useEffect(()=>{authClient.getSession().then(({data})=>setEmail(data?.user?.email??null)).catch(()=>setEmail(null))},[]);
 async function logout(){await authClient.signOut();setEmail(null);router.refresh()}
 return email?<><span className="account-email">{email}</span><button className="lang" onClick={()=>void logout()}>خروج</button></>:<a className="lang" href="/auth">الحساب</a>}
