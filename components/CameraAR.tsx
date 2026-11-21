"use client";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import * as THREE from "three";

type Props={ onClose:()=>void; language:"ar"|"en" };
export default function CameraAR({onClose,language}:Props){
 const video=useRef<HTMLVideoElement>(null);
 const host=useRef<HTMLDivElement>(null);
 const stream=useRef<MediaStream|null>(null);
 const [error,setError]=useState("");
 const [scale,setScale]=useState(1);
 const [position,setPosition]=useState({x:0,y:0});
 const [dragging,setDragging]=useState(false);
 const start=useRef({x:0,y:0,px:0,py:0});
 const ar=language==="ar";
 useEffect(()=>{
  let active=true;
  async function startCamera(){
   try{
    if(!navigator.mediaDevices?.getUserMedia) throw new Error(ar?"المتصفح لا يدعم تشغيل الكاميرا أو أن الاتصال ليس HTTPS.":"Camera access requires a supported browser and HTTPS.");
    const media=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}});
    if(!active){media.getTracks().forEach(t=>t.stop());return;}
    stream.current=media;
    if(video.current){video.current.srcObject=media;await video.current.play();}
   }catch(e){setError(e instanceof Error?e.message:"Camera permission was denied.");}
  }
  void startCamera();
  return()=>{active=false;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;};
 },[ar]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(4,3,6);camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;el.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xd8f5ff,0x153040,2));
  const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,7,5);scene.add(light);
  const tank=new THREE.Group();scene.add(tank);
  const shell=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,2.8,48,1,true),new THREE.MeshPhysicalMaterial({color:0x9edff0,metalness:.22,roughness:.16,transparent:true,opacity:.32,side:THREE.DoubleSide,clearcoat:1}));tank.add(shell);
  const rimMat=new THREE.MeshStandardMaterial({color:0x91b7c9,metalness:.78,roughness:.22});
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.08,.12,48),rimMat);lid.position.y=1.4;tank.add(lid);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.14,48),rimMat);base.position.y=-1.4;tank.add(base);
  const water=new THREE.Mesh(new THREE.CylinderGeometry(.99,.99,1,48),new THREE.MeshPhysicalMaterial({color:0x079bd5,transparent:true,opacity:.86,roughness:.12,metalness:.1,side:THREE.DoubleSide}));tank.add(water);
  const top=new THREE.Mesh(new THREE.CircleGeometry(.98,48),new THREE.MeshPhysicalMaterial({color:0x55d8f6,transparent:true,opacity:.7,side:THREE.DoubleSide}));top.rotation.x=-Math.PI/2;tank.add(top);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.07,.025,8,48),rimMat);ring.position.y=.8;tank.add(ring);
  let frame=0,raf=0;
  const resize=()=>{camera.aspect=el.clientWidth/Math.max(el.clientHeight,1);camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);};
  const animate=()=>{raf=requestAnimationFrame(animate);const h=1.8;water.scale.y=h;water.position.y=-.5;top.position.y=.4; tank.rotation.y=Math.sin(frame*.006)*.045;frame++;renderer.render(scene,camera);};
  animate();window.addEventListener("resize",resize);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose();}});if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
 },[]);
 function down(e:PointerEvent<HTMLDivElement>){setDragging(true);start.current={x:e.clientX,y:e.clientY,px:position.x,py:position.y};e.currentTarget.setPointerCapture(e.pointerId);}
 function move(e:PointerEvent<HTMLDivElement>){if(!dragging)return;setPosition({x:start.current.px+e.clientX-start.current.x,y:start.current.py+e.clientY-start.current.y});}
 const copy=ar?{title:"وضع الكاميرا والواقع المعزز",hint:"حرّك الخزان بإصبعك وضعه فوق المكان المطلوب. كبّر أو صغّر حجمه.",close:"إغلاق",zoom:"حجم الخزان",permission:"اسمح بالوصول إلى الكاميرا لبدء العرض."}:{title:"Camera & AR view",hint:"Drag the tank to position it in your camera view. Adjust its size below.",close:"Close",zoom:"Tank size",permission:"Allow camera access to start."};
 return <div className="ar-backdrop" role="dialog" aria-modal="true" aria-label={copy.title}>
  <div className="ar-window"><header className="ar-header"><div><strong>{copy.title}</strong><small>{copy.hint}</small></div><button onClick={onClose} aria-label={copy.close}>×</button></header>
   <div className="ar-stage"><video ref={video} autoPlay muted playsInline className="ar-video"/><div className="ar-grid"/><div className="ar-model" style={{transform:`translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`}} onPointerDown={down} onPointerMove={move} onPointerUp={()=>setDragging(false)} onPointerCancel={()=>setDragging(false)}><div ref={host} className="ar-three"/></div>{error&&<div className="ar-error">{error}<br/>{copy.permission}</div>}<span className="ar-live">● {ar?"معاينة الكاميرا":"CAMERA PREVIEW"}</span></div>
   <div className="ar-controls"><label>{copy.zoom}<input type="range" min=".55" max="1.5" step=".05" value={scale} onChange={e=>setScale(Number(e.target.value))}/></label><button onClick={()=>setPosition({x:0,y:0})}>{ar?"إعادة ضبط الموضع":"Reset position"}</button></div>
   <p className="ar-disclaimer">{ar?"هذه معاينة كاميرا مع نموذج ثلاثي الأبعاد متراكب؛ تثبيت الخزان على الأسطح وتتبع الحركة تلقائيًا غير متاح في هذا الوضع.":"This is a camera preview with a 3D overlay; automatic surface detection and world-anchored tracking are not available in this mode."}</p>
  </div>
 </div>;
}
