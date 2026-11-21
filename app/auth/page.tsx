"use client";
import { FormEvent,useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
export default function AuthPage(){
 const router=useRouter();const [mode,setMode]=useState<"signin"|"signup">("signin");
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [name,setName]=useState("");
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 useEffect(()=>{authClient.getSession().then(({data})=>{if(data?.user)router.replace("/")}).catch(()=>{});},[router]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage("");try{
  const result=mode==="signup"?await authClient.signUp.email({email,password,name:name.trim()||email.split("@")[0]}):await authClient.signIn.email({email,password});
  if(result.error)throw new Error(result.error.message||"Authentication failed");router.replace("/");router.refresh();
 }catch(err){setMessage(err instanceof Error?err.message:"تعذر إتمام العملية")}finally{setBusy(false)}}
 return <main className="shell auth-shell" dir="rtl"><header className="topbar"><a className="brand auth-brand" href="/"><span className="brand-mark">✦</span><span><strong>X-Ray Tank</strong><small>Smart water monitoring</small></span></a><a className="lang" href="/">العودة للوحة</a></header>
 <section className="auth-card"><span className="eyebrow">X-RAY TANK ACCOUNT</span><h1>{mode==="signin"?"مرحباً بعودتك":"أنشئ حسابك"}</h1><p className="auth-description">سجّل الدخول لحماية خزاناتك وقراءات أجهزتك ومتابعتها من أي مكان.</p>
 <div className="mode-switch auth-switch"><button type="button" className={mode==="signin"?"selected":""} onClick={()=>{setMode("signin");setMessage("")}}>تسجيل الدخول</button><button type="button" className={mode==="signup"?"selected":""} onClick={()=>{setMode("signup");setMessage("")}}>حساب جديد</button></div>
 <form onSubmit={submit} className="auth-form">{mode==="signup"&&<label>الاسم<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="اسمك"/></label>}
 <label>البريد الإلكتروني<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" dir="ltr"/></label>
 <label>كلمة المرور<input type="password" required minLength={8} autoComplete={mode==="signin"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="8 أحرف على الأقل" dir="ltr"/></label>
 {message&&<p className="error auth-error">{message}</p>}<button className="auth-submit" type="submit" disabled={busy}>{busy?"جارٍ المعالجة...":mode==="signin"?"دخول آمن":"إنشاء الحساب"}</button></form>
 <p className="auth-footnote">الحسابات والجلسات تدار عبر Neon Auth.</p></section></main>;
}
