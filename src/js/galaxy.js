import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const PHRASES = [
  'Я тебя люблю', 'I love you', "Je t'aime", 'Ich liebe dich', 'Ti amo',
  'Te quiero', 'Eu te amo', '愛してる', '사랑해', 'Seni seviyorum',
  'Ik hou van je', 'Kocham cię', 'Te iubesc', "Σ'αγαπώ", 'Volim te',
  'Mahal kita', 'אני אוהב אותך', 'أحبك', 'Main tumse pyar karta hoon',
  'Szeretlek', 'Jag älskar dig', 'Jeg elsker deg', 'Miluji tě',
  'Tá grá agam duit',
];

export function initGalaxy(canvas) {
  // ==================== СЦЕНА ====================
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05000f, 0.0016);

  const camera = new THREE.PerspectiveCamera(
    55,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    6000
  );
  camera.position.set(0, 260, 140);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // ==================== КОНТРОЛЫ ====================
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.9;
  controls.enablePan = false;
  controls.minDistance = 60;
  controls.maxDistance = 700;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 0, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
  });
  controls.addEventListener('end', () => {
    setTimeout(() => {
      controls.autoRotate = true;
    }, 2500);
  });

  // ==================== ГАЛАКТИКА ====================
  const galaxy = new THREE.Group();
  scene.add(galaxy);

  // ---- Палитра по рукавам: розовый, фиолет, голубой, персиковый ----
  const ARM_COLORS = [
    {hue: 330, glow: 'rgba(255, 120, 200, 0.9)'},  // розовый
    {hue: 275, glow: 'rgba(180, 120, 255, 0.9)'},  // фиолет
    {hue: 200, glow: 'rgba(120, 200, 255, 0.9)'},  // голубой
    {hue: 15, glow: 'rgba(255, 170, 140, 0.9)'},  // персиковый
  ];

  // ---- Текстовые спрайты с кэшем ----
  const spriteCache = new Map();

  function makeTextSprite(text, hue, glowColor) {
    const key = text + '|' + hue;
    if (spriteCache.has(key)) return spriteCache.get(key).clone();

    const dpr = Math.min(window.devicePixelRatio, 2);
    const fontSize = 72;
    const padding = 40;

    const measureCanvas = document.createElement('canvas');
    const mctx = measureCanvas.getContext('2d');
    mctx.font = `${fontSize}px "Georgia", serif`;
    const textWidth = mctx.measureText(text).width;

    const cssW = Math.ceil(textWidth + padding * 2);
    const cssH = Math.ceil(fontSize + padding * 2);

    const cv = document.createElement('canvas');
    cv.width = cssW * dpr;
    cv.height = cssH * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    ctx.font = `${fontSize}px "Georgia", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // мягкое свечение
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 28;
    ctx.fillStyle = `hsla(${hue}, 100%, 88%, 0.6)`;
    ctx.fillText(text, cssW / 2, cssH / 2);
    ctx.fillText(text, cssW / 2, cssH / 2);

    // чёткий текст сверху
    ctx.shadowBlur = 12;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, cssW / 2, cssH / 2);

    const texture = new THREE.CanvasTexture(cv);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const scale = 0.10;
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(cssW * scale, cssH * scale, 1);

    spriteCache.set(key, sprite);
    return sprite.clone();
  }

  // ---- Спиральные рукава ----
  const ARMS = 4;
  const PER_ARM = 55;
  const GALAXY_RADIUS = 200;
  const SPIRAL_TIGHTNESS = 3.6;

  for (let arm = 0; arm < ARMS; arm++) {
    const armAngle = (arm / ARMS) * Math.PI * 2;
    const {hue, glow} = ARM_COLORS[arm];

    for (let i = 0; i < PER_ARM; i++) {
      const t = i / PER_ARM;
      const radius = 25 + t * GALAXY_RADIUS;
      const angle = armAngle + t * SPIRAL_TIGHTNESS;

      // Разброс: чем дальше от центра, тем больше
      const spread = 6 + t * 35;
      const jitterR = (Math.random() - 0.5) * spread;
      const jitterA = (Math.random() - 0.5) * 0.35;
      const jitterY = (Math.random() - 0.5) * (6 + t * 10);

      const r = radius + jitterR;
      const a = angle + jitterA;

      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = jitterY;

      const phrase = PHRASES[(arm * PER_ARM + i) % PHRASES.length];
      const sprite = makeTextSprite(phrase, hue, glow);
      sprite.position.set(x, y, z);

      // Масштаб растёт к краю — слова у центра мелкие и «далёкие»
      const sizeMult = 0.6 + t * 0.9;
      sprite.scale.multiplyScalar(sizeMult);

      // Чем дальше — тем прозрачнее (глубина)
      sprite.material.opacity = 0.55 + Math.random() * 0.45;

      galaxy.add(sprite);
    }
  }

  // ---- Звёздная пыль в рукавах (мелкие точки) ----
  const dustCount = 4000;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    const arm = i % ARMS;
    const armAngle = (arm / ARMS) * Math.PI * 2;
    const t = Math.pow(Math.random(), 0.7);           // больше частиц к центру
    const radius = 15 + t * GALAXY_RADIUS;
    const angle = armAngle + t * SPIRAL_TIGHTNESS + (Math.random() - 0.5) * 0.5;

    const jitterR = (Math.random() - 0.5) * (10 + t * 40);
    const r = radius + jitterR;

    dustPositions[i * 3] = Math.cos(angle) * r;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * (4 + t * 12);
    dustPositions[i * 3 + 2] = Math.sin(angle) * r;

    const c = new THREE.Color().setHSL(
      ARM_COLORS[arm].hue / 360,
      0.9,
      0.75
    );
    dustColors[i * 3] = c.r;
    dustColors[i * 3 + 1] = c.g;
    dustColors[i * 3 + 2] = c.b;
  }

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

  const dustMat = new THREE.PointsMaterial({
    size: 1.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  galaxy.add(dust);

  // ---- Ядро: светящийся шар ----
  const coreGeo = new THREE.SphereGeometry(6, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({color: 0xffd0f0});
  const core = new THREE.Mesh(coreGeo, coreMat);
  galaxy.add(core);

  // Мягкое свечение ядра (двухслойное — большое + малое)
  function makeGlowTexture(innerColor, midColor) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.25, midColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
  }

  const glowFar = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture('rgba(255,180,230,0.55)', 'rgba(255,80,180,0.25)'),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glowFar.scale.set(180, 180, 1);
  galaxy.add(glowFar);

  const glowNear = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture('rgba(255,240,255,0.95)', 'rgba(255,150,220,0.6)'),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glowNear.scale.set(60, 60, 1);
  galaxy.add(glowNear);

  // ---- Далёкие звёзды на фоне ----
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1500;
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 700 + Math.random() * 1200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi);
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    // немного тёплых и холодных звёзд
    const c = new THREE.Color().setHSL(
      Math.random() > 0.5 ? 0.6 : 0.05,
      0.3,
      0.85
    );
    starCol[i * 3] = c.r;
    starCol[i * 3 + 1] = c.g;
    starCol[i * 3 + 2] = c.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  scene.add(stars);

  // ==================== РЕСАЙЗ ====================
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  window.addEventListener('resize', onResize);
  onResize();

  // ==================== АНИМАЦИЯ ====================
  const clock = new THREE.Clock();
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // ядро «дышит»
    const pulse = 1 + Math.sin(t * 1.4) * 0.08;
    glowNear.scale.set(60 * pulse, 60 * pulse, 1);
    glowFar.scale.set(180 * (1 + Math.sin(t * 0.9) * 0.05), 180, 1);

    // пыль еле заметно мерцает
    dust.material.opacity = 0.65 + Math.sin(t * 2) * 0.1;

    // дальние звёзды медленно плывут
    stars.rotation.y += 0.00015;

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  return {
    dispose() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    },
  };
}