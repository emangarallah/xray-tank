"use client";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import * as THREE from "three";

type Props={ onClose:()=>void; language:"ar"|"en" };
type CameraState="idle"|"requesting"|"ready"|"error";
export default function CameraAR({onClose,language}:Props){
 const video=useRef<HTMLVideoElement>(null);
 const host=useRef<HTMLDivElement>(null);
 const stream=useRef<MediaStream|null>(null);
 const [cameraState,setCameraState]=useState<CameraState>("idle");
 const [error,setError]=useState("");
 const [scale,setScale]=useState(1);
 const [level,setLevel]=useState(68);
 const levelRef=useRef(68);
 const [autoLevel,setAutoLevel]=useState(true);
 const directionRef=useRef(-1);
 const [position,setPosition]=useState({x:0,y:0});
 const [dragging,setDragging]=useState(false);
 const start=useRef({x:0,y:0,px:0,py:0});
 const ar=language==="ar";
 const copy=ar?{
  title:"وضع الكاميرا والواقع المعزز",hint:"اسمح باستخدام الكاميرا، ثم حرّك الخزان بإصبعك وكبّر حجمه.",
  close:"إغلاق",zoom:"حجم الخزان",start:"تشغيل الكاميرا",retry:"إعادة المحاولة",
  autoOn:"إيقاف الحركة التلقائية",autoOff:"تشغيل الحركة التلقائية",autoHint:"يتغير مستوى الماء تلقائيًا بين 20٪ و90٪.",
  requesting:"جارٍ طلب إذن الكاميرا…",ready:"الكاميرا تعمل",permission:"اضغط تشغيل الكاميرا ووافق على الإذن من المتصفح.",
  secure:"يلزم فتح الموقع عبر HTTPS حتى يسمح المتصفح باستخدام الكاميرا.",
  denied:"تم رفض إذن الكاميرا. افتح إعدادات الموقع في المتصفح وغيّر إذن الكاميرا إلى سماح، ثم أعد المحاولة.",
  missing:"لم يتم العثور على كاميرا متاحة على هذا الجهاز.",
  generic:"تعذر تشغيل الكاميرا. تحقق من الإذن وأن الكاميرا ليست مستخدمة في تطبيق آخر."
 }:{
  title:"Camera & AR view",hint:"Allow camera access, then drag and resize the tank.",
  close:"Close",zoom:"Tank size",start:"Start camera",retry:"Try again",
  autoOn:"Pause auto movement",autoOff:"Start auto movement",autoHint:"Water level changes automatically between 20% and 90%.",
  requesting:"Requesting camera permission…",ready:"Camera is running",permission:"Tap Start camera and allow access in your browser.",
  secure:"Camera access requires HTTPS. Open the secure website URL.",
  denied:"Camera permission was denied. Open this site's browser permissions, allow Camera, then try again.",
  missing:"No camera was found on this device.",
  generic:"Could not start the camera. Check permission and make sure another app is not using it."
 };
 async function requestCamera(){
  setError("");
  if(!window.isSecureContext){setCameraState("error");setError(copy.secure);return;}
  if(!navigator.mediaDevices?.getUserMedia){setCameraState("error");setError(copy.generic);return;}
  setCameraState("requesting");
  try{
   stream.current?.getTracks().forEach(track=>track.stop());
   let media:MediaStream;
   try{
    media=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}});
   }catch(firstError){
    const name=firstError instanceof DOMException?firstError.name:"";
    if(name==="NotFoundError"||name==="OverconstrainedError"){
     media=await navigator.mediaDevices.getUserMedia({audio:false,video:true});
    }else throw firstError;
   }
   stream.current=media;
   if(!video.current) throw new Error("Video element is not ready");
   video.current.srcObject=media;
   await video.current.play();
   setCameraState("ready");
  }catch(e){
   const name=e instanceof DOMException?e.name:"";
   let message=copy.generic;
   if(name==="NotAllowedError"||name==="PermissionDeniedError"||name==="SecurityError")message=copy.denied;
   else if(name==="NotFoundError"||name==="DevicesNotFoundError")message=copy.missing;
   else if(name==="NotReadableError"||name==="TrackStartError")message=copy.generic;
   else if(e instanceof Error&&e.message.includes("HTTPS"))message=copy.secure;
   stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;
   setError(message);setCameraState("error");
  }
 }
 useEffect(()=>{levelRef.current=level;},[level]);
 useEffect(()=>{\n  if(!autoLevel)return;\n  const timer=window.setInterval(()=>{\n   setLevel(current=>{\n    let next=current+directionRef.current*0.35;\n    if(next<=20){next=20;directionRef.current=1;}\n    if(next>=90){next=90;directionRef.current=-1;}\n    levelRef.current=next;\n    return next;\n   });\n  },50);\n  return()=>window.clearInterval(timer);\n },[autoLevel]);
 useEffect(()=>()=>{stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;},[]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(4,3,6);camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;el.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xd8f5ff,0x153040,2));
  const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,7,5);scene.add(light);
  const tank=new THREE.Group();scene.add(tank);
  const shell=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,2.8,48,1,true),new THREE.MeshPhysicalMaterial({color:0x9edff0,metalness:.22,roughness:.16,transparent:true,opacity:.32,side:THREE.DoubleSide,clearcoat:1}));tank.add(shell);
  const rimMat=new THREE.MeshStandardMaterial({color:0x91b7c9,metalness:.78,roughness:.22});
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.08,.12,48),rimMat);lid.position.y=1.4;tank.add(lid);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.14,48),rimMat);base.position.y=-1.4;tank.add(base);
  const water=new THREE.Mesh(new THREE.CylinderGeometry(.99,.99,1,48),new THREE.MeshPhysicalMaterial({color:0x079bd5,transparent:true,opacity:.86,roughness:.12,metalness:.1,side:THREE.DoubleSide}));tank.add(water);
  const top=new THREE.Mesh(new THREE.CircleGeometry(.98,48),new THREE.MeshPhysicalMaterial({color:0x55d8f6,transparent:true,opacity:.7,side:THREE.DoubleSide}));top.rotation.x=-Math.PI/2;tank.add(top);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.07,.025,8,48),new THREE.MeshStandardMaterial({color:0x55e7ff,emissive:0x087eaa,emissiveIntensity:1.4}));ring.position.y=-1.4+2.8*.68;tank.add(ring);
  let frame=0,raf=0;
  const resize=()=>{camera.aspect=el.clientWidth/Math.max(el.clientHeight,1);camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);};
  const animate=()=>{raf=requestAnimationFrame(animate);const pct=levelRef.current/100;const waterHeight=Math.max(.025,2.65*pct);water.scale.y=waterHeight;water.position.y=-1.33+waterHeight/2;top.position.y=-1.33+waterHeight;ring.position.y=-1.4+2.8*pct;tank.rotation.y=Math.sin(frame*.006)*.045;frame++;renderer.render(scene,camera);};
  animate();window.addEventListener("resize",resize);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose();}});if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
 },[]);
 function down(e:PointerEvent<HTMLDivElement>){setDragging(true);start.current={x:e.clientX,y:e.clientY,px:position.x,py:position.y};e.currentTarget.setPointerCapture(e.pointerId);}
 function move(e:PointerEvent<HTMLDivElement>){if(!dragging)return;setPosition({x:start.current.px+e.clientX-start.current.x,y:start.current.py+e.clientY-start.current.y});}
 return <div className="ar-backdrop" role="dialog" aria-modal="true" aria-label={copy.title}>
  <div className="ar-window"><header className="ar-header"><div><strong>{copy.title}</strong><small>{copy.hint}</small></div><button onClick={onClose} aria-label={copy.close}>×</button></header>
   <div className="ar-stage"><video ref={video} autoPlay muted playsInline className="ar-video"/><div className="ar-grid"/><div className="ar-model" style={{transform:`translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`}} onPointerDown={down} onPointerMove={move} onPointerUp={()=>setDragging(false)} onPointerCancel={()=>setDragging(false)}><div ref={host} className="ar-three"/></div>
    {cameraState!=="ready"&&<div className="ar-camera-prompt"><strong>{cameraState==="requesting"?copy.requesting:cameraState==="error"?copy.retry:copy.permission}</strong>{error&&<p>{error}</p>}<button onClick={()=>void requestCamera()} disabled={cameraState==="requesting"}>{cameraState==="requesting"?"…":cameraState==="error"?copy.retry:copy.start}</button></div>}
    {cameraState==="ready"&&<span className="ar-live">● {copy.ready}</span>}
   </div>
   <div className="ar-controls"><label>{copy.zoom}<input type="range" min=".55" max="1.5" step=".05" value={scale} onChange={e=>setScale(Number(e.target.value))}/></label><button onClick={()=>setPosition({x:0,y:0})}>{ar?"إعادة ضبط الموضع":"Reset position"}</button></div>
   <div className="ar-level-control"><div><strong>{ar?"مستوى الماء داخل الخزان":"Water level inside tank"}</strong><b>{Math.round(level)}% · {Math.round(level*10)} {ar?"لتر":"L"}</b></div><button type="button" onClick={()=>setAutoLevel(v=>!v)}>{autoLevel?copy.autoOn:copy.autoOff}</button><input aria-label={ar?"تغيير مستوى الماء التجريبي":"Change simulated water level"} type="range" min="0" max="100" step="1" value={Math.round(level)} onChange={e=>{const next=Number(e.target.value);directionRef.current=next>=level?1:-1;levelRef.current=next;setLevel(next);setAutoLevel(false)}}/><small>{autoLevel?copy.autoHint:(ar?"يمكنك تحريك المؤشر يدويًا أو إعادة تشغيل الحركة التلقائية.":"Move the slider manually or resume automatic movement.")} {ar?"محاكاة وليست قراءة حساس.":"Simulation only, not a sensor reading."}</small></div>
   <p className="ar-disclaimer">{ar?"هذه معاينة كاميرا مع نموذج ثلاثي الأبعاد متراكب؛ تثبيت الخزان على الأسطح وتتبع الحركة تلقائيًا غير متاح في هذا الوضع.":"This is a camera preview with a 3D overlay; automatic surface detection and world-anchored tracking are not available in this mode."}</p>
  </div>
 </div>;
}
