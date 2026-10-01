import * as THREE from './three.module.min.js';
import { audioPrefix, dict } from './audio-dict.js';

// Phantom Mask
// Alexandre Rangel, 2022-2025

// auto refresh
const REFRESH_DELAY = 25500;
let refreshInterval;
function refresh() {
    window.location.reload();
}
refreshInterval = setInterval(refresh, REFRESH_DELAY);


    let renderer, scene, camera;
    let var1, var2, var3, var4, var5, var6, var7, var8  = 0.0;

function generateRandomFloatWithTime1() {
    const currentTime = new Date().getTime();
    let seededRandom = (Math.random() * currentTime / 1000000008) % 1; // Combine and take fractional part
    var1 = seededRandom;
    return var1;
}
function generateRandomFloatWithTime2() {
    const currentTime = new Date().getTime();
    let seededRandom = (Math.random() * currentTime / 1000000007) % 1; // Combine and take fractional part
    var2 = seededRandom;
    return var2;
}
function generateRandomFloatWithTime3() {
    const currentTime = new Date().getTime();
    let seededRandom = (Math.random() * currentTime / 1000000001) % 1; // Combine and take fractional part
    var3 = seededRandom;
    return var3;
}
function generateRandomFloatWithTime4() {
    const currentTime = new Date().getTime();
    let seededRandom = (Math.random() * currentTime / 1000000002) % 1; // Combine and take fractional part
    var4 = seededRandom;
    return var4;
}
function generateRandomFloatWithTime5() {
    const currentTime = new Date().getTime();
    let seededRandom = (Math.random() * currentTime / 1000000003) % 1; // Combine and take fractional part
    var5 = seededRandom;
    return var5;
}
function generateRandomFloatWithTime6() {
    const currentTime = new Date().getTime();
    let seededRandom = (Math.random() * currentTime / 1000000004) % 1; // Combine and take fractional part
    var6 = seededRandom;
    return var6;
}
function generateRandomFloatWithTime7() {
    const currentTime = new Date().getTime();
    let seededRandom = (Math.random() * currentTime / 1000000005) % 1; // Combine and take fractional part
    var7 = seededRandom;
    return var7;
}
function generateRandomFloatWithTime8() {
    const currentTime = new Date().getTime();
    let seededRandom = (Math.random() * currentTime / 1000000006) % 1; // Combine and take fractional part
    var8 = seededRandom;
    return var8;
}

// Initialize var1 before using it
generateRandomFloatWithTime1();
generateRandomFloatWithTime2();
generateRandomFloatWithTime3();
generateRandomFloatWithTime4();
generateRandomFloatWithTime5();
generateRandomFloatWithTime6();
generateRandomFloatWithTime7();
generateRandomFloatWithTime8();

var myCanvas = document.getElementById('myCanvas');

function init() {
    if (!myCanvas) {
        console.error('Canvas element not found');
        return;
    }

    renderer = new THREE.WebGLRenderer({canvas: myCanvas, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;
    
    camera = new THREE.PerspectiveCamera(43, window.innerWidth/window.innerHeight, 1, 50);
    camera.position.set(0, 4.5, 12.5);
    
    scene = new THREE.Scene();
    let pi = Math.PI;
    console.log(' ');
    console.log('Phantom Masks');
    console.log('Alexandre Rangel, 2022-2025');
    console.log('https://www.alexandrerangel.art.br');
    console.log(' ');
    console.log('Click artwork to start audio...');
    console.log(' ');
    console.log('Hash 1: ' + var1);
    console.log('Hash 2: ' + var2);
    console.log('Hash 3: ' + var3);
    console.log('Hash 4: ' + var4);
    console.log('Hash 5: ' + var5);
    console.log('Hash 6: ' + var6);
    console.log('Hash 7: ' + var7);
    console.log('Hash 8: ' + var8);

    let rectLight0 = new THREE.RectAreaLight(0x555555, 5, 15, 5 );
    rectLight0.position.set(0,var1*4+7,var2*10+7);rectLight0.rotation.set(0,pi,0); scene.add(rectLight0);
    let redLight1 = new THREE.RectAreaLight(0x880000, var2+2, 4, 9+var1*3.33 );
    redLight1.position.set(var3*60-30,var4*6-3, 5.00 );scene.add(redLight1);
    let redLight2 = new THREE.RectAreaLight(0xff0000, var3+2, 4, 9+var2*3.33 );
    redLight2.position.set(var5*30-15,var6*6-3, 5.00 );scene.add(redLight2);
    let rectLight2 = new THREE.RectAreaLight(0x00ff00, var4+2, 4, 9+var3*3.33 );
    rectLight2.position.set(var7*60-30,var8*6-3, 5.01 );scene.add(rectLight2);
    let blueLight1 = new THREE.RectAreaLight(0x0000ff, var5+2, 4, 9+var4*3.33 );
    blueLight1.position.set(var1*30-15,var2*6-3, 5.00 );scene.add(blueLight1);
    let blueLight2 = new THREE.RectAreaLight(0x000077, var6+2, 4, 9+var5*4.3 );
    blueLight2.position.set(var3*50-25,var4*6-3, 5.00 );scene.add(blueLight2);
    let pLight=new THREE.PointLight(0x222222,20,var7*70+50 );pLight.castShadow=true;
    pLight.position.set(var5*0.2-0.1,var6*2.34+9,var8*0.2-0.1 );
    pLight.shadow.mapSize.width=1;pLight.shadow.mapSize.height=1;
    pLight.shadow.camera.near=0.1;pLight.shadow.camera.far=var7*3+11;scene.add(pLight);
    let pLightHelper=new THREE.PointLightHelper(pLight,var8*0.33+0.3);scene.add(pLightHelper);

    // clipping planes
    let planeFront=new THREE.Plane(new THREE.Vector3( 0, 0, 1 ), 0.75 );
    let planeBack=new THREE.Plane(new THREE.Vector3( 0, 0, -1 ), 0.75 );
    let planeLeft=new THREE.Plane(new THREE.Vector3( -0.9+var2*0.333, 0.2, 0.4 ), 0.8 );
    let planeRight=new THREE.Plane(new THREE.Vector3( 0.9+var7*0.333, 0.2, 0.4 ), 0.8 );

    let planeFront2=new THREE.Plane(new THREE.Vector3( 0, 0, 1 ), 0.333 );
    let planeBack2=new THREE.Plane(new THREE.Vector3( 0, 0, -1 ), 0.333 );
    let planeLeft2=new THREE.Plane(new THREE.Vector3( -0.6+var4*0.333, 0.2, 0.4 ), 0.8 );
    let planeRight2=new THREE.Plane(new THREE.Vector3( 0.6+var5*0.333, 0.2, 0.4 ), 0.8 );

    // obj0
    let geoObj0=new THREE.TorusKnotGeometry( 2+(var8*.222), 1, 180, 126 );
    let matObj0=new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0.3, metalness: 0.1,
        side:THREE.DoubleSide,clippingPlanes:[planeFront,planeBack,planeLeft,planeRight] } );
        let obj0=new THREE.Mesh( geoObj0, matObj0 );
    obj0.name = 'obj0'; obj0.position.set( 0, 5, 0 );
    let obj0RotX = var7*pi;
    let obj0RotY = var6*pi;
    let obj0RotZ = var5*pi;
    obj0.rotation.set(obj0RotX,obj0RotY,obj0RotZ);
    scene.add(obj0);

    // obj4 - lines
    let geoObj4 = new THREE.TorusKnotGeometry( var1*.322+2.5, 1.1, var2*5+5, 2 );
    let matObj4 = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: var4*0.8+0.2, metalness: var5*0.5+0.2,
        side:THREE.DoubleSide,clippingPlanes:[planeFront2,planeBack2,planeLeft,planeRight],wireframe:true } );
    let obj4 = new THREE.Mesh(geoObj4,matObj4);
    obj4.name = 'obj4';
    obj4.position.set( 0, 5, 0.2 );
    obj4.scale.set( var1*0.4+0.9 , var6*0.4+0.9 , var7*0.4+0.9 );
    obj4.rotation.set(obj0RotX,obj0RotY,obj0RotZ);
    scene.add(obj4);

    // obj1
    let geoObj1= new THREE.TorusKnotGeometry( 2+(var4*.222), 1, 200, 126 );
    let matObj1= new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0.5, metalness: 0.1,
        side:THREE.DoubleSide,clippingPlanes:[planeFront2,planeBack2,planeLeft2,planeRight2] } );
        let obj1 = new THREE.Mesh( geoObj1, matObj1 );
    obj1.name = 'obj1'; obj1.position.set( 0, 5, 0 );
    obj0.rotation.set(obj0RotX,obj0RotY,obj0RotZ);
    scene.add(obj1);

    // obj2 fine
    let geoObj2= new THREE.TorusKnotGeometry( 3.33, 0.1, 180, 90 );
    let matObj2= new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0.5, metalness: 0.24,
        side:THREE.DoubleSide,clippingPlanes:[planeFront,planeBack,planeLeft,planeRight] } );
        let obj2 = new THREE.Mesh( geoObj2, matObj2 );
    obj2.name = 'obj2'; obj2.position.set( 0, 5, 0 );
    obj2.rotation.set( var2*pi, var5*pi, var7*pi );
    scene.add(obj2);

    // obj3
    let geoObj3= new THREE.TorusKnotGeometry( 2.9, 0.0333, 250, 126 );
    let matObj3= new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, metalness: 0.0333,
        side:THREE.DoubleSide,clippingPlanes:[planeFront,planeBack,planeLeft,planeRight] } );
    let obj3 = new THREE.Mesh( geoObj3, matObj3 );
    obj3.name = 'obj3'; obj3.position.set( 0, 5, 0 );
    obj3.rotation.set( var4*pi, var3*pi, var8*pi );
    scene.add(obj3);

    //flip obj
    if (var1 > 0.5) { obj0.scale.set( -1.0, 1, 1 ); obj1.scale.set( -1.0, 1, 1 ); obj2.scale.set( -1.0, 1, 1 ); obj3.scale.set( -1.0, 1, 1 ); obj4.scale.set( -1.0, 1, 1 ); }

    window.addEventListener( 'resize', onWindowResize );
    scene.add(new THREE.CameraHelper(pLight.shadow.camera));

}

function onWindowResize(){
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect=(window.innerWidth/window.innerHeight);
    camera.updateProjectionMatrix();
}

// animation

function animation( time ) {
    let mesh0=scene.getObjectByName('obj0');
    let mesh1=scene.getObjectByName('obj1');
    let mesh2=scene.getObjectByName('obj2');
    let mesh3=scene.getObjectByName('obj3');
    let mesh4=scene.getObjectByName('obj4');
    
    if (mesh0) mesh0.rotation.y=Math.sin(time/5200)*0.333*0.52;
    if (mesh1) mesh1.rotation.y=Math.sin(time/5200)*0.333*0.52;
    if (mesh2) mesh2.rotation.y=Math.sin(time/5200)*0.36*0.52;
    if (mesh3) mesh3.rotation.y=Math.sin(time/5200)*0.369*0.52;
    if (mesh4) mesh4.rotation.y=Math.sin(time/5200)*0.39*0.52;
    
    camera.position.x=Math.sin(time/1908)*0.43;
    camera.position.y=Math.sin(time/1800/2.43)*0.43+4.5;
    camera.lookAt(0,4.85,0);
    renderer.render(scene,camera);
}

// audio 

let isAudioOff = true;

document.onclick = function() { if (isAudioOff) { isAudioOff = false; startAudio(); } }

let scale=(num,in_min,in_max,out_min,out_max)=>{return (num-in_min)*(out_max-out_min)/(in_max-in_min)+out_min}
let intScale=(num,in_min,in_max,out_min,out_max)=>parseInt(scale(num,in_min,in_max,out_min,out_max),10)

function startAudio() {
    var context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') { context.resume(); }

    // speech

    var audio = document.getElementById('audio'); var audio2 = document.getElementById('audio2'); var audio3 = document.getElementById('audio3');
    audio.autoplay = false; audio.crossOrigin = "anonymous";
    audio2.autoplay = false; audio2.crossOrigin = "anonymous";
    audio3.autoplay = false; audio.crossOrigin = "anonymous";
    
}

// Initialize after all functions are defined
init();
        
    // voice sequence

const playString = ()=>{
    for(let a=2;a<66;a+=1){

        let myTimeout = 2808 * a;
        setTimeout(function(){
            let pi = Math.PI;

            // voice
            let currentChar = Math.random() > 0.3 
            ? String.fromCharCode(65 + Math.floor(Math.random() * 26))  // A-Z
            : String.fromCharCode(48 + Math.floor(Math.random() * 10)); // 0-9

            console.log('Mask Code: ' + currentChar);

            let audioSource = (audioPrefix + dict[currentChar]);

            audio.src=audioSource;audio.playbackRate=0.25*0.9+(var1*0.1);audio.volume=0.27*0.6;audio.play();
            audio2.src=audioSource;audio2.playbackRate=0.225*0.9+(var2*0.025);audio2.volume=0.33*0.5;audio2.play();
            audio3.src=audioSource;audio3.playbackRate=0.133*0.9+(var3*0.05);audio3.volume=0.22*0.7;audio3.play();



            // animate lines
            let mesh4 = scene.getObjectByName( 'obj4' );
            mesh4.rotation.y=var2*pi;
            mesh4.rotation.z=var7*pi;
            
        }, myTimeout );
    }
}
playString();



// Initialize after all functions are defined

// Set up refresh interval
    


// Clean up on window unload
window.addEventListener('unload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    cleanup();
});