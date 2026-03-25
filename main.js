import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;
const d = 35; 
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
camera.position.set(20, 15, 50);
camera.lookAt(15, 8, 0);

const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(10, 30, 20);
sun.castShadow = true;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

//mat
const woodMat = new THREE.MeshStandardMaterial({ color: 0x784212 });
const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7B7D7D });
const pigMat = new THREE.MeshStandardMaterial({ color: 0x2ECC71 });
const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1B2631 });

//cañon
const slingshot = new THREE.Group();
const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 8, 12), woodMat);
base.position.y = 4;
slingshot.add(base);
const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 5, 12), woodMat);
forkL.position.set(-2, 9, 0); forkL.rotation.z = Math.PI/5;
slingshot.add(forkL);
const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 5, 12), woodMat);
forkR.position.set(2, 9, 0); forkR.rotation.z = -Math.PI/5;
slingshot.add(forkR);
slingshot.position.set(-25, 0, 0);
scene.add(slingshot);

const anchorL = new THREE.Vector3(-27, 11, 0);
const anchorR = new THREE.Vector3(-23, 11, 0);
const bandL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1, 8), rubberMat);
const bandR = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1, 8), rubberMat);
scene.add(bandL, bandR);

//pajaros
let birds = [];
let currentBirdIndex = 0;
const birdCount = 5;

function createBirds() {
    birds.forEach(b => scene.remove(b.mesh));
    birds = [];
    for (let i = 0; i < birdCount; i++) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), new THREE.MeshStandardMaterial({ color: 0xE74C3C }));
        mesh.castShadow = true;
        mesh.position.set(-30 - (i * 3), 1, 0); //queue
        scene.add(mesh);
        birds.push({ mesh: mesh, vel: new THREE.Vector3(), isFlying: false, isReady: false });
    }
    birds[0].mesh.position.set(-25, 10, 0);
    birds[0].isReady = true;
}

//suelo
const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 60), new THREE.MeshStandardMaterial({ color: 0x1D8348 }));
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

//estructuras
let targets = [];
const gravity = new THREE.Vector3(0, -0.018, 0);
let angle = Math.PI / 6;
let currentForce = 0;
let isCharging = false;

function createBlock(x, y, w, h, mat, isPig = false) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, 3), mat);
    block.position.set(x, y + h/2, 0);
    block.castShadow = true;
    scene.add(block);
    targets.push({ mesh: block, vel: new THREE.Vector3(), active: false, h: h, w: w, isPig: isPig });
}

function spawnLevel() {
    targets.forEach(t => scene.remove(t.mesh));
    targets = [];
    
    // ESTRUCTURA 1: Torre Izquierda
    createBlock(10, 0, 2, 8, stoneMat);
    createBlock(16, 0, 2, 8, stoneMat);
    createBlock(13, 8, 8, 1.5, stoneMat);
    createBlock(13, 1, 2, 2, pigMat, true);

    // ESTRUCTURA 2: Torre Central
    createBlock(22, 0, 1.5, 6, woodMat);
    createBlock(28, 0, 1.5, 6, woodMat);
    createBlock(25, 6, 8, 1, woodMat);
    createBlock(23, 7, 1, 5, woodMat);
    createBlock(27, 7, 1, 5, woodMat);
    createBlock(25, 12, 6, 1, woodMat);
    createBlock(25, 7, 1.5, 1.5, pigMat, true);

    // ESTRUCTURA 3: El búnker derecho
    createBlock(35, 0, 3, 4, stoneMat);
    createBlock(42, 0, 3, 4, stoneMat);
    createBlock(38.5, 4, 10, 2, stoneMat);
    createBlock(38.5, 6, 2, 2, pigMat, true);
}

//controles
document.addEventListener("keydown", (e) => {
    if (e.key === 'a') angle += 0.1;
    if (e.key === 's') angle -= 0.1;
    if (e.code === "Space" && currentBirdIndex < birdCount && !birds[currentBirdIndex].isFlying) isCharging = true;
    if (e.key.toLowerCase() === 'r') resetAll();
});

document.addEventListener("keyup", (e) => {
    if (e.code === "Space" && isCharging) {
        const bird = birds[currentBirdIndex];
        const speed = (currentForce / 100) * 1.3;
        bird.vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed, 0);
        bird.isFlying = true; 
        isCharging = false;
        currentForce = 0;
        document.getElementById('force-bar').style.width = '0%';

        //next shot
        setTimeout(() => {
            currentBirdIndex++;
            if (currentBirdIndex < birdCount) {
                birds[currentBirdIndex].mesh.position.set(-25, 10, 0);
                birds[currentBirdIndex].isReady = true;
            }
        }, 1000);
    }
});

function resetAll() {
    isCharging = false;
    currentForce = 0;
    currentBirdIndex = 0;
    document.getElementById('force-bar').style.width = '0%';
    createBirds();
    spawnLevel();
}

function updateBands() {
    let targetPos;
    if (currentBirdIndex < birdCount && !birds[currentBirdIndex].isFlying) {
        targetPos = birds[currentBirdIndex].mesh.position;
    } else {
        targetPos = anchorL.clone().lerp(anchorR, 0.5);
    }

    [bandL, bandR].forEach((b, i) => {
        const anchor = i === 0 ? anchorL : anchorR;
        b.position.copy(anchor).lerp(targetPos, 0.5);
        b.lookAt(targetPos); b.rotateX(Math.PI/2);
        b.scale.y = anchor.distanceTo(targetPos);
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (isCharging && currentBirdIndex < birdCount) {
        currentForce = Math.min(currentForce + 1.8, 100);
        document.getElementById('force-bar').style.width = currentForce + '%';
        const pullBack = currentForce / 12;
        birds[currentBirdIndex].mesh.position.set(-25 - Math.cos(angle) * pullBack, 10 - Math.sin(angle) * pullBack, 0);
    }

    //"pajaros volando"
    birds.forEach(bird => {
        if (bird.isFlying) {
            bird.vel.add(gravity);
            bird.mesh.position.add(bird.vel);

            if (bird.mesh.position.y < 1) {
                bird.mesh.position.y = 1; bird.vel.y *= -0.4; bird.vel.x *= 0.96;
            }

            // colision
            targets.forEach((t, index) => {
                const birdR = 1; 
                const halfW = t.w / 2;
                const halfH = t.h / 2;

                const closestX = Math.max(t.mesh.position.x - halfW, Math.min(bird.mesh.position.x, t.mesh.position.x + halfW));
                const closestY = Math.max(t.mesh.position.y - halfH, Math.min(bird.mesh.position.y, t.mesh.position.y + halfH));

                const distanceX = bird.mesh.position.x - closestX;
                const distanceY = bird.mesh.position.y - closestY;
                const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

                if (distanceSquared < (birdR * birdR)) {
                    //Choque
                    scene.remove(t.mesh);
                    targets.splice(index, 1);
                    
                    //Rebote
                    if (Math.abs(distanceX) > Math.abs(distanceY)) {
                        bird.vel.x *= -0.5;
                    } else {
                        bird.vel.y *= -0.5;
                    }   
                    bird.vel.multiplyScalar(0.85);
                }
            });
        }
    });

    updateBands();
    renderer.render(scene, camera);
}

spawnLevel();
createBirds();
animate();