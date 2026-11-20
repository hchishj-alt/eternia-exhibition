import * as T from 'three';
// Each container has its own volumetric body and a reference-photo front.
export function addProducts(root,texture,products){
 const normal=new T.Vector3(-.8660254,0,.5),tangent=new T.Vector3(.5,0,.8660254);
 function product(spec,center,scale=1,name='전시'){
  const g=new T.Group();g.name=name+'_'+spec.id;g.userData.productId=spec.id;g.position.set(...center);g.position.addScaledVector(normal,-.035);g.rotation.y=-Math.PI/3;root.add(g);
  const h=spec.h*scale,w=spec.w*scale,r=w*.49;
  const profile=spec.profile.map(([y,width])=>new T.Vector2(Math.max(.001,width*r),y*h));
  const mat=new T.MeshStandardMaterial({color:spec.color,roughness:.42,metalness:spec.id.startsWith('scott')?.22:.05});mat.userData.presentationWhite=!spec.id.startsWith('scott');
  const body=new T.Mesh(new T.LatheGeometry(profile,24),mat);body.name=spec.id+'_입체용기';body.scale.z=spec.tube?.38:1;g.add(body);
  const label=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture(spec.file),transparent:true,alphaTest:.18,side:T.DoubleSide}));label.position.set(0,h/2,r*(spec.tube?.39:1.01));label.name=spec.id+'_실물전면';g.add(label);
  // Blank shelf price tag in front of every product: DP detail only, no price or text.
  const tw=Math.min(w*.9,.036),th=tw*.56,tag=new T.Group();tag.name=spec.id+'_가격택';tag.position.set(0,0,r*(spec.tube?.39:1.01)+.014);tag.rotation.x=-.42;g.add(tag);
  const card=new T.Mesh(new T.BoxGeometry(tw,th,.0016),tagWhite);card.position.y=th/2;tag.add(card);
  const strip=new T.Mesh(new T.BoxGeometry(tw,th*.2,.0018),tagLime);strip.position.y=th*.9;tag.add(strip);
  const foot=new T.Mesh(new T.BoxGeometry(tw*.5,.0016,.008),tagGray);foot.position.set(0,.0008,-.003);foot.rotation.x=.42;tag.add(foot);
  return g;
 }
 const tagWhite=new T.MeshStandardMaterial({color:0xf3f4f1,roughness:.55}),tagLime=new T.MeshStandardMaterial({color:0xd7f657,roughness:.6}),tagGray=new T.MeshStandardMaterial({color:0x9aa1a4,roughness:.5,metalness:.3});
 tagWhite.userData.presentationWhite=true;
 const scott=products.filter(p=>p.id.startsWith('scott')&&p.id!=='scott-cleanser');
 const brioll=products.filter(p=>p.id.startsWith('brioll'));
 scott.forEach((p,i)=>{const c=new T.Vector3(-.84129,1.49,.23169).addScaledVector(tangent,(i-1.5)*.064).addScaledVector(normal,.012);product(p,c.toArray(),.78);});
 brioll.filter(p=>p.id!=='brioll-0').forEach((p,i)=>{const c=new T.Vector3(-.62129,1.32,.61274).addScaledVector(tangent,(i-2.5)*.045).addScaledVector(normal,.013);product(p,c.toArray(),.65);});
 // Small tester grouping, leaving each end clear for the NPC acrylics.
 const testers=[...scott,products.find(p=>p.id==='scott-cleanser'),...brioll];
 testers.forEach((p,i)=>{const c=new T.Vector3(-.82,.91,.45).addScaledVector(tangent,(i-5.5)*.045).addScaledVector(normal,.036);product(p,c.toArray(),.60,'테스터');});
}
