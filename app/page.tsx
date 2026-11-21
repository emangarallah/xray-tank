"use client";
import { useEffect, useMemo, useState } from "react";
import TankScene from "@/components/TankScene";
import TankManager from "@/components/TankManager";
import AccountMenu from "@/components/AccountMenu";

type Reading={levelPercent:number;distanceCm:number|null;temperatureC:number|null;recordedAt:string;deviceId:string};
type HistoryPoint={level_percent:number|string;recorded_at:string};
const demo:Reading={levelPercent:68,distanceCm:42.5,temperatureC:24.2,recordedAt:new Date().toISOString(),deviceId:"demo-tank"};
const emptyReading:Reading={levelPercent:0,distanceCm:null,temperatureC:null,recordedAt:"",deviceId:"tank-001"};
export default function Home(){
 const [lang,setLang]=useState<"ar"|"en">("ar");
 const [mode,setMode]=useState<"demo"|"live">("demo");
 const [reading,setReading]=useState<Reading>(demo);
 const [deviceId,setDeviceId]=useState("tank-001");
 const [capacity,setCapacity]=useState(2000);
 const [history,setHistory]=useState<HistoryPoint[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const ar=lang==="ar";
 const t=useMemo(()=>ar?{
  brand:"X-Ray Tank",sub:"مراقبة ذكية لخزان المياه",overview:"نظرة عامة",demo:"وضع تجريبي",live:"قراءة الحساس",level:"مستوى المياه",capacity:"السعة الافتراضية",remaining:"المياه المتبقية",temperature:"درجة الحرارة",distance:"مسافة الحساس",status:"حالة الخزان",normal:"مستوى جيد",low:"مستوى منخفض",refresh:"تحديث القراءة",device:"معرّف الجهاز",analytics:"مؤشرات الخزان",usage:"قراءة مباشرة من الجهاز",demoNote:"بيانات تجريبية للعرض فقط — ليست قياسًا حقيقيًا.",liveNote:"يعرض آخر قراءة محفوظة من حساس ESP32.",noData:"لا توجد قراءة لهذا الجهاز حتى الآن.",days:"تقدير توضيحي",safe:"لا تستخدم هذه الشاشة للتحكم بالمضخة أو منع الفيضان."
 }:{
  brand:"X-Ray Tank",sub:"Smart water tank monitoring",overview:"Overview",demo:"Demo mode",live:"Sensor reading",level:"Water level",capacity:"Estimated capacity",remaining:"Water remaining",temperature:"Temperature",distance:"Sensor distance",status:"Tank status",normal:"Healthy level",low:"Low level",refresh:"Refresh reading",device:"Device ID",analytics:"Tank insights",usage:"Live device reading",demoNote:"Simulated demo data only — not a real measurement.",liveNote:"Shows the latest reading stored from an ESP32 sensor.",noData:"No reading has been received for this device.",days:"Illustrative estimate",safe:"Do not use this screen for pump control or overflow prevention."
 },[ar]);
 async function refresh(){setBusy(true);setError("");try{const res=await fetch("/api/telemetry?deviceId="+encodeURIComponent(deviceId),{cache:"no-store"});const data=await res.json();if(!res.ok)throw new Error(data.error||"Unable to load reading");setCapacity(Number(data.tank.capacity_liters));setHistory(Array.isArray(data.history)?data.history:[]);if(!data.reading){setReading(emptyReading);setError(t.noData)}else setReading({levelPercent:Number(data.reading.level_percent),distanceCm:data.reading.distance_cm===null?null:Number(data.reading.distance_cm),temperatureC:data.reading.temperature_c===null?null:Number(data.reading.temperature_c),recordedAt:data.reading.recorded_at,deviceId});}catch(e){setReading(emptyReading);setError(e instanceof Error?e.message:"Network error")}finally{setBusy(false)}}
 useEffect(()=>{if(mode!=="live")return;void refresh();const timer=window.setInterval(()=>void refresh(),15000);return()=>window.clearInterval(timer);},[mode,deviceId]);
 const level=Math.max(0,Math.min(100,reading.levelPercent));
 function changeMode(next:"demo"|"live"){setMode(next);if(next==="demo"){setReading(demo);setError("")}}
 const liters=Math.round(capacity*level/100);
 const chartValues=mode==="live"?(history.length?history.slice(-7).map(p=>Number(p.level_percent)):[0,0,0,0,0,0,0]):[38,52,45,64,57,72,68];
 const lastSeen=reading.recordedAt?new Date(reading.recordedAt):null;
 const isStale=mode==="live"&&(!lastSeen||Date.now()-lastSeen.getTime()>5*60*1000);
 return <main className="shell" dir={ar?"rtl":"ltr"}>
  <header className="topbar"><div className="brand"><div className="brand-mark">✦</div><div><strong>{t.brand}</strong><small>{t.sub}</small></div></div><div className="top-actions"><AccountMenu/><button className="lang" onClick={()=>setLang(ar?"en":"ar")}>{ar?"EN":"عربي"}</button><span className={"connection "+(mode==="live"?"live":"demo")}>{mode==="live"?(isStale?"● STALE":"● LIVE"):"● DEMO"}</span></div></header>
  <section className="hero"><div><span className="eyebrow">SMART WATER INTELLIGENCE</span><h1>{t.overview}<br/><em>{t.brand}</em></h1><p>{ar?"تابع مستوى المياه بصريًا، واستقبل قراءات الحساس لاسلكيًا.":"Visualize your water level and receive wireless sensor readings."}</p></div><div className="mode-switch"><button className={mode==="demo"?"selected":""} onClick={()=>changeMode("demo")}>{t.demo}</button><button className={mode==="live"?"selected":""} onClick={()=>changeMode("live")}>{t.live}</button></div></section>
  <section className="dashboard">
   <div className="visual-card"><div className="card-head"><div><span className="eyebrow">{t.status}</span><h2>{level<25?t.low:t.normal}</h2></div><span className="pulse-dot"/></div><TankScene level={level}/><div className="tank-footer"><div><small>{t.level}</small><strong>{level.toFixed(1)}<i>%</i></strong></div><div className="progress"><span style={{width:level+"%"}}/></div></div></div>
   <div className="stats-grid"><article className="stat-card accent"><span className="stat-icon">◉</span><small>{t.level}</small><strong>{level.toFixed(1)}%</strong><div className="mini-track"><span style={{width:level+"%"}}/></div></article><article className="stat-card"><span className="stat-icon">◌</span><small>{t.remaining}</small><strong>{liters.toLocaleString()} <i>L</i></strong><small>{t.capacity}: {capacity.toLocaleString()} L</small></article><article className="stat-card"><span className="stat-icon">⌁</span><small>{t.temperature}</small><strong>{reading.temperatureC===null?"—":reading.temperatureC.toFixed(1)} <i>°C</i></strong><small>{ar?"حرارة محيطة بالحساس":"Sensor ambient temperature"}</small></article><article className="stat-card"><span className="stat-icon">↕</span><small>{t.distance}</small><strong>{reading.distanceCm===null?"—":reading.distanceCm.toFixed(1)} <i>cm</i></strong><small>{ar?"من الحساس إلى سطح الماء":"Sensor to water surface"}</small></article></div>
  </section>
  <section className="bottom-grid"><div className="panel"><div className="panel-title"><div><span className="eyebrow">{t.analytics}</span><h3>{t.usage}</h3></div><span className="spark">⌁</span></div><div className="bars">{chartValues.map((v,i)=><div className="bar-wrap" key={i}><div className="bar" style={{height:Math.max(v,2)+"%"}}/><small>{mode==="live"&&history.length?new Date(history.slice(-7)[i].recorded_at).toLocaleTimeString(ar?"ar":"en",{hour:"2-digit",minute:"2-digit"}):["M","T","W","T","F","S","S"][i]}</small></div>)}</div><p className="muted">{mode==="live"?(history.length?`${history.length} ${ar?"قراءة خلال آخر 24 ساعة":"readings in the last 24 hours"}`:t.noData):t.days}</p></div>
   <div className="panel device-panel"><div className="panel-title"><div><span className="eyebrow">{mode==="demo"?t.demo:t.live}</span><h3>{ar?"مصدر البيانات":"Data source"}</h3></div><span className="device-icon">⌁</span></div><p className="source-note">{mode==="demo"?t.demoNote:t.liveNote}</p><label>{t.device}</label><div className="device-row"><input value={deviceId} onChange={e=>setDeviceId(e.target.value)} disabled={mode==="demo"}/><button onClick={()=>void refresh()} disabled={busy||mode==="demo"}>{busy?"…":t.refresh}</button></div>{error&&<p className="error">{error}</p>}<small className="muted">{mode==="live"&&lastSeen?`${ar?"آخر قراءة: ":"Last reading: "}${lastSeen.toLocaleString(ar?"ar":"en")}${isStale?(ar?" — البيانات قديمة":" — data is stale"):""}`:""}</small></div>
  </section>
  <TankManager onSelect={(id)=>{setDeviceId(id);setMode("live");}} />
  <footer><span>© 2026 X-Ray Tank</span><span>{t.safe}</span></footer>
 </main>
}
