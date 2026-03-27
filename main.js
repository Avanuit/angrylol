import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 120, 250);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;
const d = 38;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
camera.position.set(20, 18, 55);
camera.lookAt(15, 8, 0);

const sun = new THREE.DirectionalLight(0xfffbe8, 2.2);
sun.position.set(15, 40, 30);
sun.castShadow = true;
sun.shadow.camera.left   = -80;
sun.shadow.camera.right  =  80;
sun.shadow.camera.top    =  60;
sun.shadow.camera.bottom = -20;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.002;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0x87CEEB, 0x1D8348, 0.6));
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const woodMat  = new THREE.MeshStandardMaterial({ color: 0xC68642, roughness: 0.85 });
const woodDark = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.90 });
const stoneMat = new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.95, metalness: 0.05 });
const stoneDark= new THREE.MeshStandardMaterial({ color: 0x6B6B6B, roughness: 1.00 });
const iceMat   = new THREE.MeshStandardMaterial({ color: 0xb0e8ff, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85 });
const rubberMat= new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
const pigBodyM = new THREE.MeshStandardMaterial({ color: 0x2ECC71, roughness: 0.7 });
const pigNoseM = new THREE.MeshStandardMaterial({ color: 0x27AE60, roughness: 0.6 });
const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff });
const eyeBlack = new THREE.MeshStandardMaterial({ color: 0x111111 });
const helmetM  = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.5, roughness: 0.4 });
const birdPalette = [0xE74C3C, 0xF39C12, 0x3498DB, 0x2ECC71, 0xECF0F1];

const GRAVITY   = -22;
const GROUND_Y  =  1;
const MAX_SPEED = 55;
const STEP      = 1 / 60;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 80, 40, 8),
  new THREE.MeshStandardMaterial({ color: 0x3a7d2c, roughness: 1.0 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grassDark = new THREE.MeshStandardMaterial({ color: 0x2e6624, roughness: 1.0 });
for (let i = -10; i < 20; i += 2.2) {
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 80), grassDark);
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(i * 6, 0.01, 0);
  scene.add(stripe);
}

const cloudObjects = [];
function makeCloud(x, y, z, speed) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92 });
  const g = new THREE.Group();
  [[0,0,0,2.5],[-2.5,0,0,1.8],[2.5,0,0,1.8],[0,1.2,0,2],[-1.5,1,0,1.4],[1.5,1,0,1.4]]
    .forEach(([cx,cy,cz,r]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
      m.position.set(cx, cy, cz);
      g.add(m);
    });
  g.position.set(x, y, z);
  scene.add(g);
  cloudObjects.push({ group: g, speed });
}
makeCloud(-40, 28, -20, 2.5);
makeCloud(-10, 32, -15, 2.0);
makeCloud( 30, 25, -18, 3.0);
makeCloud( 60, 30, -22, 2.2);

function makeTree(x, z) {
  const g = new THREE.Group();
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x6B4226, roughness: 1 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 5, 8), trunkM);
  trunk.position.set(0, 2.5, 0);
  g.add(trunk);
  [[0x2d7a27,6],[0x3a9a35,4.5],[0x1f5c1a,3]].forEach(([col, r], i) => {
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(r, 4, 10),
      new THREE.MeshStandardMaterial({ color: col, roughness: 1 })
    );
    leaves.position.y = 6 + i * 3;
    g.add(leaves);
  });
  g.position.set(x, 0, z);
  scene.add(g);
}
[-50, -40, 55, 65, 75].forEach(x => makeTree(x, -12));

const slingshot = new THREE.Group();
const ssBase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 9, 12), woodDark);
ssBase.position.y = 4.5;
slingshot.add(ssBase);
for (let i = 1; i < 4; i++) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 6, 12), woodMat);
  ring.position.y = i * 2;
  ring.rotation.x = Math.PI / 2;
  slingshot.add(ring);
}
const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 5.5, 10), woodDark);
forkL.position.set(-2, 9.5, 0);
forkL.rotation.z = Math.PI / 5;
slingshot.add(forkL);
const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 5.5, 10), woodDark);
forkR.position.set(2, 9.5, 0);
forkR.rotation.z = -Math.PI / 5;
slingshot.add(forkR);
slingshot.position.set(-25, 0, 0);
scene.add(slingshot);

const anchorL = new THREE.Vector3(-27.4, 11.8, 0);
const anchorR = new THREE.Vector3(-22.6, 11.8, 0);
const bandL   = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1, 8), rubberMat);
const bandR   = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1, 8), rubberMat);
scene.add(bandL, bandR);

function updateBands(birdPos) {
  const target = birdPos || anchorL.clone().lerp(anchorR, 0.5);
  [bandL, bandR].forEach((band, i) => {
    const anchor = i === 0 ? anchorL : anchorR;
    band.position.copy(anchor).lerp(target, 0.5);
    const dir = new THREE.Vector3().subVectors(target, anchor).normalize();
    band.setRotationFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    );
    band.scale.y = anchor.distanceTo(target);
  });
}

function buildBirdMesh(type) {
  const bodyMat = new THREE.MeshStandardMaterial({ color: birdPalette[type], roughness: 0.6 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.6 });
  const browMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xaa2200, roughness: 0.7 });
  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), bodyMat);
  body.castShadow = true;
  g.add(body);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8), beakMat);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.95, 0.15, 0);
  g.add(beak);

  [-0.3, 0.3].forEach(oz => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), eyeWhite);
    eye.position.set(0.75, 0.5, oz);
    g.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), eyeBlack);
    pupil.position.set(0.88, 0.52, oz);
    g.add(pupil);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.08), browMat);
    brow.position.set(0.78, 0.75, oz);
    brow.rotation.z = oz > 0 ? 0.4 : -0.4;
    g.add(brow);
  });

  for (let i = -1; i <= 1; i++) {
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 6), tailMat);
    tail.position.set(-0.9 + i * 0.1, 0.2 + i * 0.3, 0);
    tail.rotation.z = Math.PI / 2 + i * 0.3;
    g.add(tail);
  }

  if (type === 2) g.scale.setScalar(0.72);
  if (type === 4) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      helmetM
    );
    cap.position.y = 0.1;
    g.add(cap);
  }

  return g;
}

function buildPigMesh(withHelmet = false) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 20), pigBodyM);
  body.castShadow = true;
  g.add(body);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), pigNoseM);
  nose.position.set(0.9, -0.1, 0);
  g.add(nose);

  [-0.15, 0.15].forEach(oz => {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeBlack);
    nostril.position.set(1.22, -0.08, oz);
    g.add(nostril);
  });

  [-0.35, 0.35].forEach(oz => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), eyeWhite);
    eye.position.set(0.75, 0.4, oz);
    g.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), eyeBlack);
    pupil.position.set(0.94, 0.4, oz);
    g.add(pupil);
  });

  [-1, 1].forEach(side => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), pigBodyM);
    ear.position.set(0.1, 0.9, side * 0.9);
    g.add(ear);
  });

  if (withHelmet) {
    const helm = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.6),
      helmetM
    );
    helm.position.y = 0.3;
    g.add(helm);
    const brim = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.12, 8, 20), helmetM);
    brim.position.y = 0.4;
    brim.rotation.x = Math.PI / 2;
    g.add(brim);
  }

  return g;
}

let targets = [];

function addEdges(mesh, w, h, depth) {
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, depth));
  mesh.add(new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })
  ));
}

function createBlock(x, y, w, h, mat, depth = 3) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(x, y + h / 2, 0);
  scene.add(mesh);
  addEdges(mesh, w, h, depth);
  targets.push({
    mesh,
    vel: new THREE.Vector3(),
    h, w,
    isPig: false,
    hp: 1,
    bottom() { return this.mesh.position.y - this.h / 2; },
  });
}

function createPig(x, y, withHelmet = false) {
  const pigH = 2.2;
  const pigW = 2.2;
  const mesh = buildPigMesh(withHelmet);
  mesh.position.set(x, y + 1.1, 0);
  scene.add(mesh);
  targets.push({
    mesh,
    vel: new THREE.Vector3(),
    h: pigH,
    w: pigW,
    isPig: true,
    hp: withHelmet ? 2 : 1,
    bottom() { return this.mesh.position.y - this.h / 2; },
  });
}

function spawnLevel() {
  targets.forEach(t => scene.remove(t.mesh));
  targets = [];

  createBlock(10,   0, 1.8, 8,   stoneMat);
  createBlock(17,   0, 1.8, 8,   stoneMat);
  createBlock(13.5, 8, 9,   1.8, stoneDark);
  createPig  (13.5, 9.8);

  createBlock(24,  0, 1.2, 7,  woodMat);
  createBlock(30,  0, 1.2, 7,  woodMat);
  createBlock(27,  7, 8.5, 1,  woodMat);
  createBlock(24,  8, 1.2, 5,  woodMat);
  createBlock(30,  8, 1.2, 5,  woodMat);
  createBlock(27, 13, 7.5, 1,  woodDark);
  createPig  (27,  8, true);

  createBlock(37,  0, 2.5, 5,  stoneMat);
  createBlock(44,  0, 2.5, 5,  stoneMat);
  createBlock(40.5,5, 10,  2,  stoneDark);
  createBlock(40.5,7, 2,   2,  stoneMat);
  createPig  (40.5, 9);

  createBlock(53,  0, 1, 10, iceMat);
  createBlock(58,  0, 1, 10, iceMat);
  createBlock(55.5,10, 6, 1, iceMat);
  createPig  (55.5, 11);
}

const BIRD_COUNT = 5;
let birds = [];
let currentBirdIndex = 0;

function createBirds() {
  birds.forEach(b => scene.remove(b.mesh));
  birds = [];
  const queue = document.getElementById('birds-queue');
  queue.innerHTML = '';
  for (let i = 0; i < BIRD_COUNT; i++) {
    const type = i % birdPalette.length;
    const mesh = buildBirdMesh(type);
    mesh.position.set(-30 - i * 3.5, GROUND_Y, 0);
    scene.add(mesh);
    birds.push({ mesh, vel: new THREE.Vector3(), isFlying: false, type });
    const icon = document.createElement('div');
    icon.className = 'bird-icon' + (i === 0 ? ' active' : '');
    icon.id = `bird-icon-${i}`;
    queue.appendChild(icon);
  }
  birds[0].mesh.position.set(-25, 11, 0);
}

function updateBirdHUD() {
  for (let i = 0; i < BIRD_COUNT; i++) {
    const el = document.getElementById(`bird-icon-${i}`);
    if (!el) continue;
    el.className = 'bird-icon';
    if      (i < currentBirdIndex)  el.classList.add('used');
    else if (i === currentBirdIndex) el.classList.add('active');
  }
}

const trajDots = Array.from({ length: 28 }, () => {
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
  );
  dot.visible = false;
  scene.add(dot);
  return dot;
});

function showTrajectory(startPos, vel) {
  const simStep = 0.08;
  let vx = vel.x;
  let vy = vel.y;
  let px = startPos.x;
  let py = startPos.y;

  trajDots.forEach((dot, i) => {
    vy += GRAVITY * simStep;
    px += vx * simStep;
    py += vy * simStep;
    dot.position.set(px, py, 0);
    dot.visible = py > 0;
    dot.material.opacity = Math.max(0, 0.6 - i * 0.02);
  });
}

function hideTrajectory() {
  trajDots.forEach(d => { d.visible = false; });
}

let score = 0;

function addScore(pts) {
  score += pts;
  document.getElementById('score-val').textContent = score.toLocaleString();
  const el = document.createElement('div');
  el.className = 'hit-effect';
  el.textContent = '+' + pts;
  el.style.left = (Math.random() * 180 + window.innerWidth / 2 - 90) + 'px';
  el.style.top  = (Math.random() * 80  + window.innerHeight / 2 - 60) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

const debrisPool = [];

function spawnDebris(pos, isPig) {
  const count = isPig ? 10 : 6;
  const color = isPig ? 0x2ecc71 : 0xc68642;
  for (let i = 0; i < count; i++) {
    const s = 0.1 + Math.random() * 0.35;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, s, s),
      new THREE.MeshStandardMaterial({ color, roughness: 0.9, transparent: true, opacity: 1 })
    );
    mesh.position.copy(pos);
    scene.add(mesh);
    debrisPool.push({
      mesh,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 10 + 4,
        (Math.random() - 0.5) * 4
      ),
      life: 1.5 + Math.random() * 0.8,
    });
  }
}

function stepDebris(dt) {
  for (let i = debrisPool.length - 1; i >= 0; i--) {
    const d = debrisPool[i];
    d.vel.y += GRAVITY * dt;
    d.mesh.position.addScaledVector(d.vel, dt);
    d.mesh.rotation.x += 6 * dt;
    d.mesh.rotation.y += 4 * dt;
    d.life -= dt;
    d.mesh.material.opacity = Math.max(0, d.life / 2);
    if (d.life <= 0) {
      scene.remove(d.mesh);
      debrisPool.splice(i, 1);
    }
  }
}

let angle      = Math.PI / 5;
let chargeAmt  = 0;
let isCharging = false;
let gameActive = false;

document.addEventListener('keydown', e => {
  if (!gameActive) return;
  if (e.key === 'a' || e.key === 'A') angle = Math.min(angle + 0.06, Math.PI * 0.45);
  if (e.key === 's' || e.key === 'S') angle = Math.max(angle - 0.06, 0.05);
  if (e.code === 'Space') {
    e.preventDefault();
    if (currentBirdIndex < BIRD_COUNT && !birds[currentBirdIndex].isFlying)
      isCharging = true;
  }
  if (e.key === 'r' || e.key === 'R') resetAll();
});

document.addEventListener('keyup', e => {
  if (!gameActive) return;
  if (e.code === 'Space' && isCharging) launchBird();
});

function launchBird() {
  const bird  = birds[currentBirdIndex];
  const speed = (chargeAmt / 100) * MAX_SPEED;
  bird.vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed, 0);
  bird.isFlying = true;
  isCharging = false;
  chargeAmt  = 0;
  document.getElementById('force-bar').style.width = '0%';
  hideTrajectory();

  setTimeout(() => {
    currentBirdIndex++;
    updateBirdHUD();
    if (currentBirdIndex < BIRD_COUNT) {
      birds[currentBirdIndex].mesh.position.set(-25, 11, 0);
    }
    checkLose();
  }, 2200);
}

function pigsAlive() {
  return targets.filter(t => t.isPig && t.mesh.parent === scene);
}

function checkWin() {
  if (!gameActive) return;
  if (pigsAlive().length === 0) {
    addScore((BIRD_COUNT - currentBirdIndex) * 1000);
    setTimeout(() => showEnd(true), 1000);
  }
}

function checkLose() {
  if (!gameActive) return;
  if (currentBirdIndex >= BIRD_COUNT && pigsAlive().length > 0) {
    setTimeout(() => showEnd(false), 2200);
  }
}

function showEnd(won) {
  gameActive = false;
  const ov = document.getElementById('overlay');
  ov.innerHTML = `
    <h1>${won ? 'Victoria!' : 'Intentalo de nuevo!'}</h1>
    <p>${won ? 'Derribaste a todos los cerdos!' : 'Quedaron cerdos en pie...'}</p>
    <div class="final-score">Puntaje: ${score.toLocaleString()}</div>
    <button id="btn-start">JUGAR DE NUEVO</button>
  `;
  ov.style.display = 'flex';
  document.getElementById('btn-start').addEventListener('click', startGame);
}

function resetAll() {
  isCharging = false;
  chargeAmt  = 0;
  currentBirdIndex = 0;
  score = 0;
  document.getElementById('score-val').textContent = '0';
  document.getElementById('force-bar').style.width = '0%';
  hideTrajectory();
  spawnLevel();
  createBirds();
  updateBirdHUD();
}

function startGame() {
  document.getElementById('overlay').style.display = 'none';
  gameActive = true;
  resetAll();
}

document.getElementById('btn-start').addEventListener('click', startGame);

function physicsStep(dt) {
  if (isCharging && currentBirdIndex < BIRD_COUNT) {
    chargeAmt = Math.min(chargeAmt + 90 * dt, 100);
    document.getElementById('force-bar').style.width = chargeAmt + '%';

    const pullBack = chargeAmt / 11;
    const birdPos  = new THREE.Vector3(
      -25 - Math.cos(angle) * pullBack,
      11  - Math.sin(angle) * pullBack,
      0
    );
    birds[currentBirdIndex].mesh.position.copy(birdPos);

    const previewSpeed = (chargeAmt / 100) * MAX_SPEED;
    showTrajectory(birdPos, new THREE.Vector3(
      Math.cos(angle) * previewSpeed,
      Math.sin(angle) * previewSpeed,
      0
    ));
  }

  birds.forEach(bird => {
    if (!bird.isFlying) return;

    bird.vel.y += GRAVITY * dt;
    bird.mesh.position.addScaledVector(bird.vel, dt);
    bird.mesh.rotation.z -= 5 * dt;

    if (bird.mesh.position.y < GROUND_Y) {
      bird.mesh.position.y = GROUND_Y;
      bird.vel.y *= -0.35;
      bird.vel.x *= 0.88;
      if (Math.abs(bird.vel.y) < 0.5) bird.vel.y = 0;
    }

    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      if (t.mesh.parent !== scene) continue;

      const birdR = 1;
      const hw    = t.w / 2 + birdR;
      const hh    = t.h / 2 + birdR;
      const dx    = bird.mesh.position.x - t.mesh.position.x;
      const dy    = bird.mesh.position.y - t.mesh.position.y;

      if (Math.abs(dx) < hw && Math.abs(dy) < hh) {
        t.vel.x += bird.vel.x * 0.5;
        t.vel.y += bird.vel.y * 0.3;

        if (Math.abs(dx) > Math.abs(dy)) bird.vel.x *= -0.5;
        else                              bird.vel.y *= -0.5;
        bird.vel.multiplyScalar(0.75);

        t.hp--;
        if (t.hp <= 0) {
          addScore(t.isPig ? 500 : 100);
          spawnDebris(t.mesh.position.clone(), t.isPig);
          scene.remove(t.mesh);
          targets.splice(i, 1);
        }
        break;
      }
    }
  });

  targets.forEach(t => {
    if (t.mesh.parent !== scene) return;
    t.vel.y += GRAVITY * dt;
    t.mesh.position.addScaledVector(t.vel, dt);
    t.mesh.rotation.z += t.vel.x * 0.04 * dt;

    const bot = t.bottom();
    if (bot < 0) {
      t.mesh.position.y -= bot;
      t.vel.y = t.vel.y < 0 ? t.vel.y * -0.2 : t.vel.y;
      t.vel.x *= 0.80;
      if (Math.abs(t.vel.y) < 0.5) t.vel.y = 0;
    }
  });

  const alive = targets.filter(t => t.mesh.parent === scene);
  alive.sort((a, b) => a.bottom() - b.bottom());

  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const lower = alive[i];
      const upper = alive[j];

      const overlapX = (lower.w / 2 + upper.w / 2) - Math.abs(upper.mesh.position.x - lower.mesh.position.x);
      if (overlapX <= 0) continue;

      const penetration = (lower.mesh.position.y + lower.h / 2) - upper.bottom();
      if (penetration > 0 && penetration < upper.h * 0.9) {
        upper.mesh.position.y += penetration;
        if (upper.vel.y < 0) upper.vel.y = 0;
        upper.vel.x += lower.vel.x * 0.2;
      }
    }
  }

  stepDebris(dt);

  if (currentBirdIndex < BIRD_COUNT && !birds[currentBirdIndex].isFlying) {
    updateBands(birds[currentBirdIndex].mesh.position);
  } else {
    updateBands(null);
  }
}

let lastTime = null;

function loop(now) {
  requestAnimationFrame(loop);
  if (lastTime === null) { lastTime = now; }
  const dt = Math.min((now - lastTime) / 1000, STEP);
  lastTime = now;

  cloudObjects.forEach(c => {
    c.group.position.x += c.speed * dt;
    if (c.group.position.x > 130) c.group.position.x = -110;
  });

  if (gameActive) {
    physicsStep(dt);
    checkWin();
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  const a = window.innerWidth / window.innerHeight;
  camera.left  = -d * a;
  camera.right =  d * a;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

spawnLevel();
createBirds();
requestAnimationFrame(loop);