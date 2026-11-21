"use client";
import {useEffect,useRef} from "react";
import * as THREE from "three";
export default function TankScene({level}:{level:number}){
 const host=useRef<HTMLDivElement>(null);
 const levelRef=useRef(level);levelRef.current=level;
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color("#0c1824");
  const camera=new THREE.PerspectiveCamera(34,el.clientWidth/Math.max(el.clientHeight,1),.1,100);camera.position.set(5,4.2,7);camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;el.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xb9d8ed,1.5));const key=new THREE.DirectionalLight(0x8bdcff,3);key.position.set(4,7,5);scene.add(key);const rim=new THREE.PointLight(0x14b8a6,16,12);rim.position.set(-4,1,-3);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,3.2,64,1,true),new THREE.MeshPhysicalMaterial({color:0x91d9ef,metalness:.15,roughness:.12,transparent:true,opacity:.22,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:.1}));group.add(glass);
  const top=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,.09,64),new THREE.MeshStandardMaterial({color:0x42677d,metalness:.7,roughness:.25}));top.position.y=1.6;group.add(top);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.28,.14,64),new THREE.MeshStandardMaterial({color:0x36596d,metalness:.65,roughness:.3}));base.position.y=-1.62;group.add(base);
  const waterMat=new THREE.MeshPhysicalMaterial({color:0x0797d5,metalness:.18,roughness:.12,transparent:true,opacity:.88,side:THREE.DoubleSide,clearcoat:1});
  const water=new THREE.Mesh(new THREE.CylinderGeometry(1.19,1.19,1,64,1),waterMat);group.add(water);
  const surface=new THREE.Mesh(new THREE.CircleGeometry(1.18,64),new THREE.MeshPhysicalMaterial({color:0x36c8f3,transparent:true,opacity:.72,roughness:.12,side:THREE.DoubleSide}));surface.rotation.x=-Math.PI/2;group.add(surface);
  const rings=new THREE.Mesh(new THREE.TorusGeometry(1.27,.025,8,64),new THREE.MeshStandardMaterial({color:0x7ca7ba,metalness:.8,roughness:.2}));rings.position.y=.8;group.add(rings);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.7,64),new THREE.MeshBasicMaterial({color:0x142a39,transparent:true,opacity:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.72;scene.add(floor);
  let frame=0;let raf=0;const resize=()=>{if(!el.clientWidth)return;camera.aspect=el.clientWidth/Math.max(el.clientHeight,1);camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)};
  const animate=()=>{raf=requestAnimationFrame(animate);const h=Math.max(.02,Math.min(100,levelRef.current))/100*2.9;water.scale.y=h;water.position.y=-1.48+h/2;surface.position.y=-1.48+h;surface.position.z=0;group.rotation.y=Math.sin(frame*.003)*.08;frame++;renderer.render(scene,camera)};animate();window.addEventListener("resize",resize);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose()}});el.removeChild(renderer.domElement)};
 },[]);
 return <div className="tank-canvas" ref={host} aria-label="Interactive 3D water tank visualization"/>;
}
