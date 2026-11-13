import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=false; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
const scene=new THREE.Scene(); scene.background=new THREE.Color('#a9c5cc'); scene.fog=new THREE.FogExp2('#a9c5cc',.0028);
const camera=new THREE.PerspectiveCamera(63,innerWidth/innerHeight,.1,1200);
scene.add(new THREE.HemisphereLight('#e5f4ff','#927d5b',2.1));
const sun=new THREE.DirectionalLight('#fff0d1',2.25); sun.position.set(-100,150,80); scene.add(sun);
const clock=new THREE.Clock();
const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={road:mat('#333a3c'),line:mat('#e9e3ca'),white:mat('#f3eee1'),sand:mat('#d6c6a4'),sidewalk:mat('#b9ad91'),blue:mat('#4b9eb6'),blue2:mat('#26748b'),yellow:mat('#ddbb64'),green:mat('#607b4e'),leaf:mat('#8b9b57'),dark:mat('#202729'),rubber:mat('#16191a'),glass:new THREE.MeshStandardMaterial({color:'#8daeb1',roughness:.27,metalness:.08}),red:mat('#a4372d'),police:mat('#e9ece8'),chrome:mat('#aeb6b4',.25,.78)};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),mat('#a89068')); ground.rotation.x=-Math.PI/2; ground.position.y=-.12; scene.add(ground);
const city=new THREE.Group(); scene.add(city);
const boxGeo=new THREE.BoxGeometry(1,1,1); const cylGeo=new THREE.CylinderGeometry(1,1,1,12);
function box(parent,x,y,z,sx,sy,sz,material){const o=new THREE.Mesh(boxGeo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o}
function cylinder(parent,x,y,z,r,h,material,segments=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),material);o.position.set(x,y,z);parent.add(o);return o}
function roadRect(x,z,w,d){box(city,x,-.045,z,w,.08,d,M.road)}
function stripe(x,z,w,d){box(city,x,.005,z,w,.018,d,M.line)}
function buildRoads(){
 roadRect(0,0,15,1000); roadRect(-60,0,12,1000); roadRect(60,0,10,1000);
 for(let z=-490;z<500;z+=10){stripe(0,z,.13,4.5);stripe(-60,z,.12,4);stripe(60,z,.12,4)}
 for(const x of [-7.3,7.3,-66, -54,55,65])box(city,x,.04,0,.24,.1,1000,M.sidewalk);
 for(const z of [-240,-90,105,300]){roadRect(0,z,62,15);for(let x=-28;x<30;x+=4)stripe(x,z,2.1,.16);for(let x of [-10,-8,-6,-4,-2,0,2,4,6,8,10])box(city,x,.03,z-7.5,.55,.08,.14,M.white);}
 // Roundabout island with raised curb and fountain
 const island=new THREE.Mesh(new THREE.CylinderGeometry(13,13,.4,48),M.green);island.position.set(0,.1,-90);city.add(island);
 const curb=new THREE.Mesh(new THREE.TorusGeometry(13,.45,8,48),M.white);curb.rotation.x=Math.PI/2;curb.position.set(0,.34,-90);city.add(curb);
 const fountain=cylinder(city,0,.65,-90,3,.8,M.sand,24);cylinder(city,0,1.1,-90,1.8,.22,M.blue2,24);cylinder(city,0,1.35,-90,.35,.9,M.white,12);
 for(let i=0;i<8;i++){const a=i*Math.PI/4; const tree=new THREE.Group();cylinder(tree,0,.85,0,.23,1.7,mat('#67503a'));const crown=new THREE.Mesh(new THREE.SphereGeometry(1.05,9,7),M.leaf);crown.position.y=2.1;tree.add(crown);tree.position.set(Math.cos(a)*8,.2,-90+Math.sin(a)*8);city.add(tree)}
 // coastal avenue and a scenic curbside promenade
 roadRect(0,-390,240,26); for(let x=-110;x<120;x+=8)stripe(x,-390,5,.15);
}
buildRoads();

// Whitewashed Mediterranean blocks, shutters, balconies and storefronts.
const facadeMats=['#e9dfc9','#f0eadc','#d9d0be','#e7e2d4','#c9c4b5'].map(c=>mat(c));
const shutterMats=['#4f817e','#527086','#967a55'].map(c=>mat(c));
function building(x,z,w,d,h,kind=0){
 const g=new THREE.Group(),wall=facadeMats[Math.floor(Math.random()*facadeMats.length)];
 box(g,0,h/2,0,w,h,d,wall);box(g,0,h+.25,0,w+.3,.5,d+.3,mat(kind===1?'#bd7950':'#ede7d7'));
 if(kind===1){box(g,0,h+.55,0,w+.55,.18,d+.55,M.red);box(g,0,h+.9,d/2+.03,w*.7,.4,.06,M.white);}
 const floors=Math.floor(h/3.1), cols=Math.max(2,Math.floor(w/2.5));
 for(let f=0;f<floors;f++)for(let c=0;c<cols;c++){
  const xx=-w/2+(c+.5)*w/cols, yy=1.15+f*3.1;
  if(yy>h-1)continue;
  box(g,xx,yy,d/2+.035,.95,1.35,.08,M.glass);box(g,xx,yy,d/2+.09,.12,1.5,.1,shutterMats[(c+f)%3]);
  box(g,xx,yy-.78,d/2+.24,1.16,.11,.5,mat('#ddd6c5'));
  if(f>0)box(g,xx,yy-.55,d/2+.43,1.3,.08,.08,M.dark);
 }
 // Ground-floor shop fronts and painted signboards
 if(kind===1){box(g,0,1.55,d/2+.12,w*.75,.47,.12,mat('#234b4d'));box(g,0,1.58,d/2+.2,w*.56,.08,.025,M.yellow);}
 g.position.set(x,0,z);city.add(g);
}
function palm(x,z,scale=1){const g=new THREE.Group();cylinder(g,0,2.4,0,.18*scale,4.8*scale,mat('#826445'));for(let i=0;i<7;i++){let a=i*Math.PI*2/7;const leaf=box(g,Math.cos(a)*1.15*scale,4.65*scale,Math.sin(a)*1.15*scale,2.7*scale,.12*scale,.4*scale,M.green);leaf.rotation.y=-a;leaf.rotation.z=Math.sin(a)*-.32;}g.position.set(x,0,z);city.add(g)}
for(let z=-475;z<470;z+=36){
 for(const side of [-1,1]){
  const x=side*(18+Math.random()*1.5), w=7+Math.random()*5,d=15+Math.random()*10,h=7+Math.random()*13;
  building(x,z+Math.random()*8,w,d,h,Math.random()<.24?1:0);
  if(Math.abs(z+90)>22 && Math.random()<.62)palm(side*(11.5+Math.random()),z+10, .7+Math.random()*.4);
 }
}
// Neighborhood silhouettes and coastal hills on the horizon
for(let i=0;i<24;i++){let x=(i-12)*32;let h=10+Math.random()*24;building(x,-560-Math.random()*40,23,26,h,0)}
// Tunisian road furniture: lamp posts, directional signs and traffic lights.
const lampMat=mat('#394344',.4,.4);
for(let z=-450;z<450;z+=38)for(const x of [-10.5,10.5]){
 cylinder(city,x,3.8,z,.12,7.6,lampMat);const arm=box(city,x+(x<0?1:-1),7.3,z,2,.13,.14,lampMat);box(city,x+(x<0?2:-2),7.1,z,.65,.14,.42,M.yellow);
}
function sign(x,y,z,textColor=M.white){box(city,x,y,z,1.6,1.1,.12,M.blue2);box(city,x,y,z+.08,1.38,.88,.04,textColor);cylinder(city,x,y-1.1,z,.06,2.2,lampMat)}
sign(-10,2.6,-80);sign(10,2.6,105);
// traffic lights at the central junction
for(const x of [-9,9]){cylinder(city,x,3,-90,.12,6,lampMat);box(city,x,5,-90,.38,1.2,.35,M.dark);for(let i=0;i<3;i++){const c=[M.red,M.yellow,M.green][i];const l=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),c);l.position.set(x,5.35-i*.35,-89.8);city.add(l)}}

const vehicleRoot=new THREE.Group();scene.add(vehicleRoot);
function wheel(parent,x,y,z,r=.37){const w=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.19,16),M.rubber);w.rotation.z=Math.PI/2;w.position.set(x,y,z);parent.add(w);const hub=new THREE.Mesh(new THREE.CylinderGeometry(r*.42,r*.42,.205,12),M.chrome);hub.rotation.z=Math.PI/2;hub.position.copy(w.position);parent.add(hub);return w}
function makeBike(color='#39a94b'){
 const g=new THREE.Group(),paint=mat(color,.32,.24),black=mat('#202627',.55),rim=M.chrome;
 wheel(g,0,.42,.98,.37);wheel(g,0,.42,-.98,.37);
 // fork tubes, swing arm, exposed engine and trellis frame
 for(const x of [-.11,.11]){const fork=cylinder(g,x,.95,.68,.045,.85,rim,10);fork.rotation.x=-.22;const back=cylinder(g,x,.72,-.55,.055,.92,black,10);back.rotation.x=-.35}
 box(g,0,.83,0,.15,.16,1.18,mat('#b62e26',.35,.35));
 const engine=new THREE.Mesh(new THREE.BoxGeometry(.61,.55,.5),mat('#6a7472',.45,.65));engine.position.set(0,.75,-.08);g.add(engine);
 // sculpted tank, seat, tail and front cowl
 const tank=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),paint);tank.scale.set(.42,.34,.58);tank.position.set(0,1.34,.1);g.add(tank);
 box(g,0,1.16,-.58,.48,.22,.52,black);box(g,0,1.29,-.9,.45,.32,.36,paint);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),M.white);head.scale.set(.8,.65,.6);head.position.set(0,1.2,.86);g.add(head);
 box(g,0,1.22,1.08,.32,.08,.08,M.yellow);
 // handlebar, mirrors and twin exhausts
 box(g,0,1.55,.62,.86,.06,.07,black);for(const x of [-.42,.42]){cylinder(g,x,1.75,.56,.035,.42,black,8);const m=new THREE.Mesh(new THREE.SphereGeometry(.095,8,6),M.chrome);m.scale.set(1,.5,1.3);m.position.set(x,1.98,.56);g.add(m)}
 for(const x of [-.22,.22]){const ex=cylinder(g,x,.74,-.83,.08,.72,M.chrome,12);ex.rotation.x=Math.PI/2;}
 // compact rider silhouette, helmet & jacket
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.55,4,8),mat('#222d31'));torso.position.set(0,1.85,-.06);torso.rotation.x=-.22;g.add(torso);
 const helmet=new THREE.Mesh(new THREE.SphereGeometry(.22,12,9),mat('#d7dbd4',.25,.25));helmet.position.set(0,2.24,.35);g.add(helmet);
 const visor=new THREE.Mesh(new THREE.SphereGeometry(.13,10,7),mat('#223a44',.2,.35));visor.scale.set(1,.6,.35);visor.position.set(0,2.25,.51);g.add(visor);
 g.userData={type:'bike',wheels:[...g.children].filter(c=>c.geometry?.type==='CylinderGeometry')};return g;
}
function makeCar(color='#c5d0d1', police=false){
 const g=new THREE.Group(),paint=mat(color,.3,.28),glass=mat('#293c42',.24,.2),trim=mat('#252a2b',.42,.3);
 box(g,0,.67,0,1.9,.48,4.35,paint);box(g,0,.93,-.1,1.68,.22,3.8,paint);
 box(g,0,1.35,-.18,1.62,.83,2.2,paint);
 box(g,0,1.4,.96,1.52,.62,.12,glass);box(g,0,1.4,-1.31,1.48,.61,.12,glass);
 for(const x of [-.83,.83]){box(g,x,1.37,-.16,.06,.65,2.05,trim);box(g,x,1.35,.67,.06,.62,.62,glass);box(g,x,1.35,-.9,.06,.62,.6,glass)}
 for(const x of [-1,1])for(const z of [-1.34,1.34]){wheel(g,x,.39,z,.36);box(g,x*1.03,.42,z,.11,.5,.75,trim)}
 box(g,0,.76,2.18,1.15,.22,.08,M.white);box(g,0,.76,-2.18,1.12,.2,.08,M.red);
 for(const x of [-.62,.62]){const light=new THREE.Mesh(new THREE.BoxGeometry(.42,.2,.07),M.white);light.position.set(x,.85,2.2);g.add(light)}
 if(police){box(g,0,1.85,0,.82,.16,.35,M.police);box(g,-.25,1.86,0,.22,.12,.28,M.blue2);box(g,.25,1.86,0,.22,.12,.28,M.red)}
 g.userData={type:police?'police':'car',wheels:g.children.filter(c=>c.geometry?.type==='CylinderGeometry')};return g;
}
const vehicleSpecs={bike:{name:'Kawasaki Z750',class:'NAKED · 750 CC',meta:'2008 · 6 SPEED'},car:{name:'Volkswagen Golf 7',class:'HATCHBACK · 2.0 TDI',meta:'2017 · DSG 6 SPEED'}};
let vehicleType='bike',playerModel,vehicleColor='#39a94b';
function setVehicle(type){if(playerModel)vehicleRoot.remove(playerModel);vehicleType=type;playerModel=type==='bike'?makeBike(vehicleColor):makeCar(vehicleColor);vehicleRoot.add(playerModel);document.querySelector('#vehicleName').innerHTML=type==='bike'?'Kawasaki <strong>Z750</strong>':'Volkswagen <strong>Golf 7</strong>';document.querySelector('#vehicleClass').textContent=vehicleSpecs[type].class;document.querySelector('#vehicleMeta').textContent=vehicleSpecs[type].meta;document.querySelector('#driveModeLabel').textContent=type==='bike'?'MANUAL':'AUTOMATIC';document.querySelector('.shift-controls').style.display=type==='bike'?'flex':'none';showToast(type==='bike'?'Kawasaki Z750 ready':'Volkswagen Golf 7 ready')}
setVehicle('bike');

// Roadside services and local details bring the avenue to life.
function shop(x,z,label,color='#31595a'){
 const g=new THREE.Group();box(g,0,2.2,0,8,4.4,7,facadeMats[1]);box(g,0,4.5,0,8.2,.35,7.2,mat('#e8e2d4'));box(g,0,3.8,3.55,7.4,.72,.16,mat(color));
 box(g,0,1.35,3.56,2.1,2.5,.12,M.glass);for(let i=-1;i<=1;i++)box(g,i*2.35,1.4,3.61,.12,2.65,.12,M.white);
 const sign=box(g,0,3.82,3.68,5.3,.28,.05,M.yellow);g.position.set(x,0,z);city.add(g);return g;
}
shop(19,-22,'CAFÉ','#31585a');shop(-20,34,'ÉPICERIE','#8a633e');shop(20,155,'STATION','#426650');
// Petrol canopy and pumps
box(city,20,5,154,11,.4,9,M.white);for(const x of [15.5,24.5])box(city,x,2.5,154,.25,5,.25,M.white);for(const z of [150,155,160]){box(city,17,1,z,.55,2,.48,M.red);box(city,23,1,z,.55,2,.48,M.blue)}
// Palm-lined pedestrian promenade, benches and a bus shelter.
for(let z=-435;z<-330;z+=17){palm(-17,z,1.1);box(city,-13,.45,z,2.2,.18,.5,mat('#856f52'));box(city,-13,.9,z-.15,2.2,.7,.15,mat('#507469'))}
box(city,-18,1.55,38,5.2,.14,1.1,M.dark);box(city,-18,1.5,38,4.7,.1,.75,M.glass);for(let x of [-20,-18,-16])box(city,x,1,38,.12,2,.12,lampMat);
// distant sea and coastal low-rise silhouettes
const sea=new THREE.Mesh(new THREE.PlaneGeometry(2000,500),mat('#689da1',.28,.2));sea.rotation.x=-Math.PI/2;sea.position.set(0,-.08,-680);scene.add(sea);

// Traffic follows the city avenues; all agents are lightweight procedural cars.
const traffic=[];
const trafficColors=['#ddd5c5','#a4332b','#547387','#d3ac56','#273b42','#e7e4dc'];
for(let i=0;i<9;i++){
 const car=makeCar(trafficColors[i%trafficColors.length],i===7);const lane=i%3,dir=(i%2===0)?1:-1;
 car.position.set(lane===0?-3.8:lane===1?3.8:58,0,-410+i*91);car.rotation.y=dir===1?0:Math.PI;scene.add(car);
 car.rotation.y=dir===1?Math.PI:0;traffic.push({obj:car,dir,speed:5+Math.random()*5,lane});
}
const pedestrians=[];const pedestrianMat=mat('#d2b798');
for(let i=0;i<12;i++){const p=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.18,.62,3,6),[mat('#424e4d'),mat('#a75135'),mat('#d1bd8b'),mat('#263e57')][i%4]);body.position.y=.75;p.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),pedestrianMat);head.position.y=1.28;p.add(head);p.position.set(i%2?-11:11,0,-360+i*62);city.add(p);pedestrians.push(p)}

// World-space landmarks with Tunis GPS entries: La Marsa, Gammarth, Carthage, Sidi Bou Said and Tunis centre.
const landmarks=[{name:'La Marsa · Avenue Habib Bourguiba',z:0},{name:'Carthage · Avenue de la République',z:-95},{name:'Sidi Bou Said · Route du Phare',z:-220},{name:'Gammarth · Route Touristique',z:-390},{name:'Tunis Centre · Avenue de France',z:305}];
let playerZ=0,playerX=0,speed=0,steer=0,gear=1,throttle=0,brake=0,handbrake=false,autoMode=true,policeChase=false;
const keys={};
function showToast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>el.classList.remove('show'),2100)}
function nearestLandmark(){return landmarks.reduce((a,b)=>Math.abs(b.z-playerZ)<Math.abs(a.z-playerZ)?b:a)}
function renderMap(c,large=false){
 const ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#748568';ctx.fillRect(0,0,w,h);
 // block texture and coastline edge
 ctx.fillStyle='#d5c4a0';ctx.fillRect(0,0,w,h);ctx.fillStyle='#6d9ca0';ctx.fillRect(0,h*.02,w*.13,h*.32);
 ctx.strokeStyle='#c2b89e';ctx.lineWidth=large?15:10;for(let x=15;x<w;x+=large?86:39){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=10;y<h;y+=large?76:36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 ctx.strokeStyle='#e7e4d5';ctx.lineWidth=large?8:4;ctx.beginPath();ctx.moveTo(w*.54,0);ctx.lineTo(w*.54,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,h*.52);ctx.lineTo(w,h*.52);ctx.stroke();
 ctx.fillStyle='#9b4a3a';ctx.beginPath();ctx.arc(w*.55,h*.29,large?6:3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#387c68';ctx.beginPath();ctx.arc(w*.38,h*.76,large?6:3,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#f0da63';ctx.beginPath();ctx.arc(w*.55,h*.51,large?8:4,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff';ctx.font=`${large?12:7}px DM Sans`;ctx.fillText('LA MARSA',w*.57,h*.49);if(large){ctx.fillText('CARTHAGE',w*.59,h*.27);ctx.fillText('TUNIS',w*.28,h*.79);ctx.fillText('GAMMARTH',w*.15,h*.19)}
}
renderMap(document.querySelector('#mapCanvas'));

// Driving controls support keyboard, gamepad-like on-screen hold controls and touch.
function bindHold(button,fn){button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);fn(true);button.classList.add('active')});const end=e=>{fn(false);button.classList.remove('active')};button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);button.addEventListener('lostpointercapture',end)}
let touchThrottle=0,touchBrake=0;
document.querySelectorAll('[data-control]').forEach(el=>bindHold(el,on=>{const c=el.dataset.control;if(c==='left')keys.ArrowLeft=on;if(c==='right')keys.ArrowRight=on;if(c==='throttle')touchThrottle=on?1:0;if(c==='brake')touchBrake=on?1:0}));
addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='KeyC')cycleCamera();if(e.code==='KeyV')openPanel('vehicles');if(e.code==='KeyM')openPanel('map');if(e.code==='KeyG')openPanel('garage');if(e.code==='KeyH')handbrake=!handbrake;if(e.code==='KeyE')shift(1);if(e.code==='KeyQ')shift(-1)});
addEventListener('keyup',e=>keys[e.code]=false);
document.querySelector('#upGear').onclick=()=>shift(1);document.querySelector('#downGear').onclick=()=>shift(-1);
function shift(n){gear=Math.max(1,Math.min(6,gear+n));showToast(`Gear ${gear}`)}
let cameraMode=2,droneAngle=0;
function cycleCamera(){cameraMode=(cameraMode+1)%7;const names=['RIDER CAM','COCKPIT','CHASE CAM','FRONT CAM','REAR CAM','360° CAM','DRONE CAM'];showToast(names[cameraMode])}
document.querySelector('#cameraBtn').onclick=cycleCamera;
document.querySelector('#vehicleBtn').onclick=()=>openPanel('vehicles');document.querySelector('#garageBtn').onclick=()=>openPanel('garage');document.querySelector('#mapBtn').onclick=()=>openPanel('map');document.querySelector('#gpsBtn').onclick=()=>openPanel('map');document.querySelector('#settingsBtn').onclick=()=>openPanel('settings');
document.querySelector('#hornBtn').onclick=()=>showToast('Beep beep!');document.querySelector('#handbrakeBtn').onclick=()=>{handbrake=!handbrake;showToast(handbrake?'Handbrake on':'Handbrake off')};
const overlay=document.querySelector('#overlay'),content=document.querySelector('#panelContent');document.querySelector('#closePanel').onclick=()=>overlay.classList.remove('open');overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open')});
function openPanel(type){overlay.classList.add('open');if(type==='vehicles'){
 content.innerHTML=`<div class="eyebrow">FREE RIDE · VEHICLE SELECT</div><h2>Choose your ride</h2><p class="sub">Two keys to the open road. More vehicles arrive with the full Tunisia map.</p><div class="vehicle-options"><button class="option ${vehicleType==='bike'?'selected':''}" data-vehicle="bike"><span class="tag">750 CC</span><span class="vehicle-icon">🏍️</span><strong>Kawasaki Z750</strong><small>NAKED · 6 SPEED · 2008</small></button><button class="option ${vehicleType==='car'?'selected':''}" data-vehicle="car"><span class="tag">2.0 TDI</span><span class="vehicle-icon">🚘</span><strong>Volkswagen Golf 7</strong><small>HATCHBACK · DSG · 2017</small></button></div><div class="panel-footer"><button class="primary" id="driveNow">BACK TO DRIVE</button></div>`;
 content.querySelectorAll('[data-vehicle]').forEach(b=>b.onclick=()=>{vehicleColor=b.dataset.vehicle==='bike'?'#39a94b':'#c5d0d1';setVehicle(b.dataset.vehicle);content.querySelectorAll('.option').forEach(x=>x.classList.toggle('selected',x===b))});content.querySelector('#driveNow').onclick=()=>overlay.classList.remove('open');
 }else if(type==='garage'){
 content.innerHTML=`<div class="eyebrow">WORKSHOP · CUSTOMIZATION</div><h2>Garage</h2><p class="sub">Tune your ${vehicleSpecs[vehicleType].name}. Changes are ready to try immediately.</p><div class="tab-row"><button class="tab active">PERFORMANCE</button><button class="tab">STYLE</button><button class="tab">ACCESSORIES</button></div><div class="tune-grid"><div class="tune-item"><b>Engine tune · Stage 1</b><small>Sharper throttle response · +8% power</small><button data-upgrade="8">INSTALL · FREE</button></div><div class="tune-item"><b>Engine tune · Stage 2</b><small>Intake, ECU & exhaust · +16% power</small><button data-upgrade="16">INSTALL · FREE</button></div><div class="tune-item"><b>Performance exhaust</b><small>Akrapovič-inspired deep exhaust note</small><button data-upgrade="sound">EQUIP · FREE</button></div><div class="tune-item"><b>Paint & finish</b><small>Choose a fresh color for your ride</small><button id="paintBtn">CHANGE COLOR</button></div></div><div class="panel-footer"><button class="primary" id="garageClose">ROAD TEST ↗</button></div>`;
 content.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{if(b.dataset.upgrade==='sound')showToast('Performance exhaust fitted');else{power=1+Number(b.dataset.upgrade)/100;showToast(`Stage tune installed · +${b.dataset.upgrade}% power`)}});content.querySelector('#paintBtn').onclick=()=>{const colors=['#39a94b','#cf3c30','#2177a7','#e7e1d3','#e2af3e','#35383c'];vehicleColor=colors[(colors.indexOf(vehicleColor)+1+colors.length)%colors.length];setVehicle(vehicleType);showToast('New paint applied')};content.querySelector('#garageClose').onclick=()=>overlay.classList.remove('open');
 }else if(type==='map'){
 content.innerHTML=`<div class="eyebrow">LIVE GPS · TUNIS GOVERNORATE</div><h2>Explore the coast</h2><p class="sub">Your free ride around La Marsa, Carthage and the northern Tunis coast.</p><div class="map-large"><canvas id="largeMap" width="900" height="500"></canvas></div><div class="map-key"><span>Current location</span><span>Fuel station</span><span>Police station</span><span>Garage</span></div><div class="panel-footer"><button class="primary" id="mapClose">RESUME DRIVE</button></div>`;renderMap(content.querySelector('#largeMap'),true);content.querySelector('#mapClose').onclick=()=>overlay.classList.remove('open');
 }else{
 content.innerHTML=`<div class="eyebrow">RIDE TUNISIA · PREFERENCES</div><h2>Settings</h2><p class="sub">A comfortable ride on mobile or desktop.</p><div class="settings-grid"><div class="setting-row"><b>Language</b><select id="language"><option>English</option><option>العربية</option><option>Français</option><option>Italiano</option><option>Español</option><option>Русский</option><option>Svenska</option><option>Türkçe</option></select><small>Interface language</small></div><div class="setting-row"><b>Performance counter</b><select id="fpsToggle"><option value="on">Show FPS</option><option value="off">Hide FPS</option></select><small>Lightweight rendering · 30 FPS target</small></div><div class="setting-row"><b>Transmission</b><select id="transmission"><option value="auto">Automatic</option><option value="manual">Manual</option></select><small>Available for the Golf 7</small></div><div class="setting-row"><b>Audio</b><small>Procedural engine & road ambience active</small></div></div><div class="panel-footer"><button class="primary" id="settingsClose">DONE</button></div>`;
 content.querySelector('#fpsToggle').onchange=e=>document.querySelector('#fps').classList.toggle('hidden',e.target.value==='off');content.querySelector('#transmission').onchange=e=>{autoMode=e.target.value==='auto';document.querySelector('#driveModeLabel').textContent=autoMode?'AUTOMATIC':'MANUAL'};content.querySelector('#settingsClose').onclick=()=>overlay.classList.remove('open');
 }}
let power=1,damage=0,gameSeconds=16*3600+42*60,prevGovernorate='Tunis';

// A quiet synthesized motor tone responds to throttle and speed after the first input.
let audioCtx,engineOsc,engineGain;
function startAudio(){if(audioCtx)return;try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();engineOsc=audioCtx.createOscillator();engineGain=audioCtx.createGain();engineOsc.type='sawtooth';engineOsc.frequency.value=65;engineGain.gain.value=.0001;engineOsc.connect(engineGain);engineGain.connect(audioCtx.destination);engineOsc.start()}catch(e){}}
addEventListener('pointerdown',startAudio,{once:true});addEventListener('keydown',startAudio,{once:true});
function updateAudio(){if(engineOsc&&engineGain){const rpm=vehicleType==='bike'?1100+speed*88+throttle*700:800+speed*45+throttle*400;engineOsc.frequency.setTargetAtTime(rpm/18,audioCtx.currentTime,.08);engineGain.gain.setTargetAtTime(.009+throttle*.018+Math.min(speed/100,.008),audioCtx.currentTime,.08)}}
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener('resize',resize);
let frames=0,fpsTime=0,currentFps=60,lastLabel='';
function update(dt){
 // keyboard and touch controls
 const forward=keys.ArrowUp||keys.KeyW,back=keys.ArrowDown||keys.KeyS;
 const turnL=keys.ArrowLeft||keys.KeyA,turnR=keys.ArrowRight||keys.KeyD;
 throttle=Math.max(touchThrottle,forward?1:0);brake=Math.max(touchBrake,back?1:0);
 const steeringInput=(turnR?1:0)-(turnL?1:0);steer+=((steeringInput)-steer)*Math.min(1,dt*4);
 const maxSpeed=vehicleType==='bike'?190:175;
 if(throttle>0)speed+=((vehicleType==='bike'?17:13)*power*throttle)*dt;
 if(brake>0)speed-=27*brake*dt;
 if(handbrake)speed-=20*dt;
 if(!throttle&&!brake)speed-=Math.sign(speed)*Math.min(Math.abs(speed),dt*(speed>1?2.3:0));
 speed=THREE.MathUtils.clamp(speed,0,maxSpeed);
 if(Math.abs(speed)<.05)speed=0;
 playerX+=steer*speed*.011*dt;playerX=THREE.MathUtils.clamp(playerX,-68,68);
 playerZ-=speed/3.6*dt;
 vehicleRoot.position.set(playerX,0,playerZ);vehicleRoot.rotation.y=steer*.2;
 if(playerModel?.userData.type==='bike'){playerModel.rotation.z=-steer*Math.min(speed/75,1)*.35;playerModel.rotation.x=throttle*.015}
 if(playerModel?.userData.type==='car'){playerModel.rotation.z=-steer*Math.min(speed/100,.5)*.12}
 // traffic flows in opposite lanes and wraps back into the playable avenue
 for(const a of traffic){a.obj.position.z-=a.dir*a.speed*dt;if(a.obj.position.z < -475)a.obj.position.z=470;if(a.obj.position.z>475)a.obj.position.z=-470}
 for(let i=0;i<pedestrians.length;i++){const p=pedestrians[i];p.position.x+=(i%2?1:-1)*Math.sin(performance.now()*.00025+i)*dt*.12}
 // traffic collision / bodywork damage
 for(const a of traffic){const dz=Math.abs(a.obj.position.z-playerZ),dx=Math.abs(a.obj.position.x-playerX);if(dz<3.2&&dx<2.1&&speed>7){speed*=.48;damage=Math.min(100,damage+8);showToast('Collision · vehicle damage');a.obj.position.z-=12}}
 // Camera modes: rider, cockpit, chase, front, rear, orbital and elevated drone.
 const bike=vehicleType==='bike';let offset,target;
 switch(cameraMode){case 0:offset=new THREE.Vector3(0,bike?2.5:2.1,-.3);target=new THREE.Vector3(steer*2,1.3,-17);break;
 case 1:offset=new THREE.Vector3(0,bike?1.7:1.55,.55);target=new THREE.Vector3(0,1.25,15);break;
 case 3:offset=new THREE.Vector3(0,2.4,8);target=new THREE.Vector3(0,1,0);break;
 case 4:offset=new THREE.Vector3(0,2.1,-10);target=new THREE.Vector3(0,1,-18);break;
 case 5:droneAngle+=dt*.28;offset=new THREE.Vector3(Math.sin(droneAngle)*8,4,Math.cos(droneAngle)*8);target=new THREE.Vector3(0,1,0);break;
 case 6:offset=new THREE.Vector3(0,23,12);target=new THREE.Vector3(0,0,-12);break;
 default:offset=new THREE.Vector3(0,bike?4.2:4.7,-9.6);target=new THREE.Vector3(0,1,-3);}
 camera.position.copy(vehicleRoot.position).add(offset);camera.lookAt(vehicleRoot.position.clone().add(target));
 gameSeconds+=dt*15;const t=Math.floor(gameSeconds)%86400,hour=Math.floor(t/3600),mins=Math.floor((t%3600)/60);document.querySelector('#clock').textContent=`${String(hour).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
 const label=nearestLandmark().name;if(label!==lastLabel){lastLabel=label;document.querySelector('#locationLabel').textContent=label}
 document.querySelector('#speed').textContent=String(Math.round(speed)).padStart(3,'0');document.querySelector('#speedBar').style.width=`${Math.min(100,speed/maxSpeed*100)}%`;
 document.querySelector('#gear').textContent=vehicleType==='bike'?gear:(autoMode?(speed<1?'P':speed<8?'1':'D'):gear);
 document.querySelector('#rpmLabel').textContent=`${Math.round((vehicleType==='bike'?1100+speed*88:800+speed*45)+throttle*700).toLocaleString()} RPM`;
 updateAudio();frames++;fpsTime+=dt;if(fpsTime>=.5){currentFps=Math.round(frames/fpsTime);document.querySelector('#fps').textContent=`${currentFps} FPS`;frames=0;fpsTime=0}
 // Violations near the roundabout / aggressive overspeed bring a police pursuit.
 if(speed>95&&Math.abs(playerZ+90)<100&&!policeChase){policeChase=true;showToast('Speed violation · police alerted');setTimeout(()=>policeChase=false,12000)}
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);update(dt);renderer.render(scene,camera)}
// Initial atmospheric view places the rider at La Marsa, looking toward the roundabout.
camera.position.set(0,5,-10);camera.lookAt(0,1,-20);animate();
