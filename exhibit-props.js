import * as T from 'three';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
export function addExhibitProps(root,texture){
 const white=new T.MeshStandardMaterial({color:0xf1f2ef,roughness:.62}),ivory=new T.MeshStandardMaterial({color:0xd5d9d6,roughness:.8}),gray=new T.MeshStandardMaterial({color:0x697174,roughness:.85}),dark=new T.MeshStandardMaterial({color:0x25272d,roughness:.9}),black=new T.MeshStandardMaterial({color:0x111318,roughness:.9}),lime=new T.MeshStandardMaterial({color:0xd7f657,roughness:.78}),silver=new T.MeshStandardMaterial({color:0xa2a9ab,metalness:.6,roughness:.36});
 white.userData.presentationWhite=true;ivory.userData.presentationWhite=true;lime.userData.presentationWhite=true;
 let count=0;function mesh(g,mat,parent,name){const m=new T.Mesh(g,mat);m.name=name||'전시소품_'+(++count);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(p,dim,pos,mat=white,r=.005,name){const m=mesh(new RoundedBoxGeometry(...dim,2,Math.min(r,...dim.map(x=>x*.45))),mat,p,name);m.position.set(...pos);return m;}
 function cyl(p,r,h,pos,mat,name){const m=mesh(new T.CylinderGeometry(r,r,h,18),mat,p,name);m.position.set(...pos);return m;}
 function rod(p,a,b,r,mat=dark,name){const d=new T.Vector3(...b).sub(new T.Vector3(...a));const m=cyl(p,r,d.length(),new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5).toArray(),mat,name);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function decal(p,pos,w,h,file,rot=0,name){const m=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture(file),transparent:true,alphaTest:.15,side:T.DoubleSide}),p,name);m.position.set(...pos);m.rotation.y=rot;return m;}
 // White peripherals: every base is supported by the desk's y=.750 top.
 const kb=new T.Group();kb.name='WHITE_KEYBOARD_테이블위';kb.position.set(-.47,.750,-.04);kb.rotation.y=Math.PI/3;root.add(kb);
 box(kb,[.36,.014,.132],[0,.007,0],white,.007,'키보드_화이트_하우징');box(kb,[.345,.002,.116],[0,.015,0],ivory,.003,'키보드_키베드');
 const rows=[14,14,13,12,9];
 rows.forEach((n,row)=>{for(let col=0;col<n;col++){let w=.020,xx=-.157+col*.023;if(row===4){const widths=[.025,.025,.025,.113,.025,.025,.025,.019,.019];w=widths[col];xx=-.157;for(let j=0;j<col;j++)xx+=widths[j]+.003;xx+=w/2-.01;}const key=box(kb,[w,.010,.0185],[xx,.021,-.046+row*.023],white,.0025,`键帽_${row}_${col}`);if(row<4&&col<11){const tick=box(kb,[.003,.0007,.0015],[xx-.003,.0264,-.049+row*.023],gray,.0002,'键帽字符');}}});
 const mouse=new T.Group();mouse.name='WHITE_MOUSE_桌面';mouse.position.set(-.345,.75,-.235);mouse.rotation.y=Math.PI/3;root.add(mouse);
 const body=mesh(new T.SphereGeometry(1,20,12),white,mouse,'마우스_곡면');body.scale.set(.031,.021,.050);body.position.y=.021;box(mouse,[.0015,.002,.050],[0,.038,-.015],ivory,.0005,'마우스_버튼분리');const wheel=cyl(mouse,.007,.008,[0,.041,-.018],gray,'마우스_스크롤휠');wheel.rotation.z=Math.PI/2;
 // Gaming chair inspired by the two-slot racing back, lumbar pad and wide armrests in the supplied photograph.
 const chair=new T.Group();chair.name='GAMING_CHAIR_참고사진기준';chair.position.set(.05,0,.05);chair.rotation.y=Math.PI/3;root.add(chair);
 cyl(chair,.024,.31,[0,.25,0],silver,'체어_가스봉');box(chair,[.35,.055,.40],[0,.445,0],dark,.025,'체어_시트');box(chair,[.29,.022,.31],[0,.479,-.01],gray,.012,'체어_시트쿠션');
 for(const sign of[-1,1]){box(chair,[.052,.065,.38],[sign*.17,.49,.002],black,.018,'체어_시트볼스터');rod(chair,[sign*.22,.40,.02],[sign*.22,.61,.02],.012,black,'체어_팔지지대');box(chair,[.068,.031,.22],[sign*.22,.625,-.005],dark,.014,'체어_팔걸이');}
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const x=Math.cos(a)*.24,z=Math.sin(a)*.24;rod(chair,[0,.115,0],[x,.065,z],.013,dark,'체어_오발');const wheel=cyl(chair,.025,.035,[x,.035,z],black,'체어_캐스터');wheel.rotation.x=Math.PI/2;}
 const outline=[[-.145,0],[-.18,.14],[-.195,.37],[-.22,.47],[-.17,.56],[-.145,.67],[-.11,.715],[.11,.715],[.145,.67],[.17,.56],[.22,.47],[.195,.37],[.18,.14],[.145,0]];
 const shape=new T.Shape(outline.map(p=>new T.Vector2(...p)));
 for(const sign of [-1,1]){const x=sign*.065;const hole=new T.Path();hole.moveTo(x-.027,.54);hole.lineTo(x-.023,.594);hole.lineTo(x+.026,.594);hole.lineTo(x+.031,.54);hole.closePath();shape.holes.push(hole);}
 const back=mesh(new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012}),dark,chair,'체어_두슬롯_등받이');back.position.set(0,.47,.15);back.rotation.x=-.065;
 box(chair,[.19,.13,.035],[0,.67,.125],black,.018,'체어_허리쿠션');box(chair,[.23,.19,.030],[0,.86,.13],gray,.014,'체어_등쿠션');box(chair,[.16,.09,.027],[0,1.11,.158],dark,.014,'체어_헤드쿠션');
 // Empty outerwear on a simple wall hanger: no body, mannequin or full costume.
 const coat=new T.Group();coat.name='NARIN_OUTER_화이트라임_후드재킷';coat.position.set(.635,0,-.365);coat.rotation.y=-Math.PI/3;root.add(coat);
 decal(coat,[0,1.16,.03],.60,.64,'coat-hanging.png',0,'아우터_이미지_옷걸이');
 // A small white HEXABLOOM tumbler at the left corner of the desk.
 const cup=new T.Group();cup.name='HEXABLOOM_화이트텀블러';cup.position.set(-.735,.75,.13);cup.rotation.y=Math.PI/3;root.add(cup);cyl(cup,.031,.138,[0,.069,0],white,'텀블러_바디');cyl(cup,.033,.009,[0,.142,0],ivory,'텀블러_뚜껑');cyl(cup,.026,.003,[0,.148,0],dark,'텀블러_뚜껑인서트');decal(cup,[0,.075,.0315],.043,.030,'ui-hexabloom-mark.png',0,'텀블러_헥사블룸로고');
 // Small sci-fi prop pistol, kept above its two-prong display stand on the desktop.
 const gun=new T.Group();gun.name='인게임_권총_데스크거치대';gun.position.set(-.48,.75,-.39);gun.rotation.y=Math.PI/3;root.add(gun);box(gun,[.17,.009,.072],[0,.0045,0],dark,.008,'권총_거치대바닥');for(const x of[-.045,.045]){rod(gun,[x,.009,0],[x,.052,0],.005,silver,'권총_거치봉');box(gun,[.018,.012,.035],[x,.051,0],ivory,.004,'권총_받침');}box(gun,[.132,.034,.038],[0,.085,0],white,.006,'권총_화이트배럴');box(gun,[.024,.031,.042],[.075,.085,0],ivory,.003,'권총_총구');box(gun,[.003,.018,.023],[.088,.085,0],black,.002,'권총_총구안쪽');const grip=box(gun,[.036,.060,.032],[-.042,.048,0],gray,.005,'권총_그립');grip.rotation.z=-.22;box(gun,[.035,.008,.041],[-.025,.107,0],lime,.002,'권총_연두패널');box(gun,[.055,.008,.040],[.034,.065,0],lime,.002,'권총_아래테이프');

 // Fourth support stays under the trapezoid's wide end.
 box(root,[.042,.725,.042],[.075,.3625,-.715],white,.003,'Desk_leg_04');
 const pc=new T.Group();pc.name='화이트_PC_책상아래';pc.position.set(-.48,.02,-.29);pc.scale.set(.88,1,.82);pc.rotation.y=Math.PI/3;root.add(pc);
 box(pc,[.19,.38,.32],[0,.19,0],white,.009,'PC_화이트케이스');box(pc,[.176,.30,.006],[0,.222,.164],dark,.004,'PC_전면유리');
 for(const y of [.11,.225,.335]){const fan=mesh(new T.TorusGeometry(.044,.006,6,20),ivory,pc,'PC_팬링');fan.position.set(0,y,.17);for(let i=0;i<5;i++){const blade=box(pc,[.014,.043,.002],[Math.sin(i*1.257)*.018,y+Math.cos(i*1.257)*.018,.171],white,.002,'PC_팬블레이드');blade.rotation.z=-i*1.257;}}
 box(pc,[.006,.30,.28],[-.098,.222,0],new T.MeshStandardMaterial({color:0x8a9a9c,transparent:true,opacity:.25}),.002,'PC_측면유리');
 return {keyboard:kb,mouse,chair,coat,tumbler:cup,weapon:gun,deskTop:.750};
}
