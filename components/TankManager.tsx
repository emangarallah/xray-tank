"use client";
import {useEffect,useState} from "react";
type Tank={id:string;name:string;capacity_liters:string|number;created_at:string};
export default function TankManager({onSelect}:{onSelect:(id:string)=>void}){
 const [tanks,setTanks]=useState<Tank[]>([]);const [name,setName]=useState("الخزان الرئيسي");const [capacity,setCapacity]=useState("2000");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [deviceKey,setDeviceKey]=useState("");
 async function load(){try{const r=await fetch("/api/tanks",{cache:"no-store"});const d=await r.json();if(r.ok)setTanks(d.tanks||[]);else if(r.status!==401)setError(d.error||"تعذر تحميل الخزانات")}catch{setError("تعذر الاتصال بالخادم")}}
 useEffect(()=>{void load()},[]);
 async function rotate(id:string){setError("");setDeviceKey("");try{const r=await fetch("/api/tanks/"+encodeURIComponent(id)+"/rotate-key",{method:"POST"});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر تجديد المفتاح");setDeviceKey(d.deviceKey);onSelect(id)}catch(e){setError(e instanceof Error?e.message:"تعذر تجديد المفتاح")}}
 async function create(){setBusy(true);setError("");setDeviceKey("");try{const r=await fetch("/api/tanks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,capacityLiters:Number(capacity)})});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر إنشاء الخزان");setTanks(old=>[d.tank,...old]);setDeviceKey(d.deviceKey);onSelect(d.tank.id)}catch(e){setError(e instanceof Error?e.message:"تعذر إنشاء الخزان")}finally{setBusy(false)}}
 return <section className="panel tank-manager" dir="rtl"><div className="panel-title"><div><span className="eyebrow">YOUR TANKS</span><h3>إدارة الخزانات والأجهزة</h3></div><span className="device-icon">⌁</span></div>
 <div className="tank-create"><label>اسم الخزان<input value={name} onChange={e=>setName(e.target.value)} maxLength={80}/></label><label>السعة باللتر<input type="number" min="10" max="10000000" value={capacity} onChange={e=>setCapacity(e.target.value)}/></label><button onClick={()=>void create()} disabled={busy}>{busy?"جارٍ الإنشاء...":"إضافة خزان"}</button></div>
 {error&&<p className="error">{error}</p>}
 {tanks.length>0&&<div className="tank-list">{tanks.map(t=><div className="tank-item-wrap" key={t.id}><button className="tank-item" onClick={()=>onSelect(t.id)}><strong>{t.name}</strong><small dir="ltr">{t.id} · {Number(t.capacity_liters).toLocaleString()} L</small></button><button className="tank-rotate" onClick={()=>void rotate(t.id)}>تجديد المفتاح</button></div>)}</div>}
 {deviceKey&&<div className="device-secret"><strong>مفتاح الجهاز — يظهر مرة واحدة فقط</strong><p>انسخه الآن واحفظه في إعدادات ESP32. لن نعرضه مرة أخرى.</p><code>{deviceKey}</code><button onClick={()=>navigator.clipboard.writeText(deviceKey)}>نسخ المفتاح</button></div>}
 {tanks.length===0&&!error&&<p className="source-note">سجّل الدخول أولاً، ثم أضف خزانك لإنشاء معرّف ومفتاح آمن خاص بالجهاز.</p>}
 </section>;
}
