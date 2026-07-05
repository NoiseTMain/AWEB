/* ============================================================
   logo3d.js — interaktivní 3D monogram "AH" v Hero sekci
   - postavené přímo v kódu (žádný externí soubor k nahrávání)
   - tažením myší / prstem otáčení doleva/doprava i nahoru/dolů
   - po puštění zůstává model v poslední pozici (žádný auto-reset)
   - jemné nasvícení (bílé + tyrkysové + fialové) + plynulá animace
     při načtení
   - pokud WebGL / three.js / font není dostupný, potichu se použije
     záložní fotografie / placeholder, aby web fungoval vždy
============================================================ */

const LOGO3D_FONT_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

function initLogo3D() {
  const mount = document.querySelector("[data-hero-photo]");
  if (!mount || !window.THREE || !THREE.FontLoader || !THREE.TextGeometry || !supportsWebGL()) return false;

  mount.innerHTML = `<div class="logo3d-loading"><span></span></div>`;
  const canvasWrap = document.createElement("div");
  canvasWrap.className = "logo3d-canvas";
  mount.appendChild(canvasWrap);

  const width = mount.clientWidth || 360;
  const height = mount.clientHeight || 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
  camera.position.set(0, 0, 6.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
  canvasWrap.appendChild(renderer.domElement);

  // Jemné nasvícení: měkké okolní světlo + hlavní + barevné doplňkové
  // (tyrkysová/fialová), aby monogram "chytal" barvy webu i bez
  // barevného materiálu.
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const fillPurple = new THREE.DirectionalLight(0x7c5cff, 0.9);
  fillPurple.position.set(-4, -1, 3);
  scene.add(fillPurple);
  const rimTeal = new THREE.DirectionalLight(0x2ee6c8, 1.0);
  rimTeal.position.set(2, -3, -4);
  scene.add(rimTeal);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.7;
  controls.minPolarAngle = Math.PI * 0.28;
  controls.maxPolarAngle = Math.PI * 0.72;

  let group = null;
  let destroyed = false;

  const failSafeTimer = setTimeout(() => {
    if (!group) revertToFallback(mount);
  }, 15000);

  const fontLoader = new THREE.FontLoader();
  fontLoader.load(
    LOGO3D_FONT_URL,
    (font) => {
      if (destroyed) return;
      clearTimeout(failSafeTimer);

      const extrudeSettings = {
        font, size: 1.6, height: 0.4, curveSegments: 10,
        bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.03, bevelSegments: 6,
      };

      const matA = new THREE.MeshStandardMaterial({ color: 0xb9a9ff, metalness: 0.75, roughness: 0.22 });
      const matH = new THREE.MeshStandardMaterial({ color: 0x8ff2e4, metalness: 0.75, roughness: 0.22 });

      const geoA = new THREE.TextGeometry("A", extrudeSettings);
      geoA.computeBoundingBox();
      const meshA = new THREE.Mesh(geoA, matA);

      const geoH = new THREE.TextGeometry("H", extrudeSettings);
      geoH.computeBoundingBox();
      const meshH = new THREE.Mesh(geoH, matH);

      const widthA = geoA.boundingBox.max.x - geoA.boundingBox.min.x;
      const gap = 0.28;
      meshA.position.x = 0;
      meshH.position.x = widthA + gap;

      group = new THREE.Group();
      group.add(meshA, meshH);

      // vystředit celou skupinu na počátek
      const box = new THREE.Box3().setFromObject(group);
      const center = new THREE.Vector3();
      box.getCenter(center);
      group.children.forEach((m) => m.position.sub(center));

      // zvětšit na jednotnou velikost bez ohledu na font metriky
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y) || 1;
      const targetScale = 2.6 / maxDim;

      scene.add(group);
      mount.querySelector(".logo3d-loading")?.remove();

      if (window.gsap) {
        group.scale.setScalar(targetScale * 0.001);
        gsap.to(group.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 1.1, ease: "power3.out" });
        gsap.from(canvasWrap, { opacity: 0, duration: 0.8, ease: "power2.out" });
      } else {
        group.scale.setScalar(targetScale);
      }
    },
    undefined,
    (err) => {
      console.error("3D monogram se nepodařilo sestavit:", err);
      clearTimeout(failSafeTimer);
      revertToFallback(mount);
    }
  );

  function animate() {
    if (destroyed) return;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    const w = mount.clientWidth || width;
    const h = mount.clientHeight || height;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  mount._destroy3D = () => {
    destroyed = true;
    window.removeEventListener("resize", onResize);
    controls.dispose();
    renderer.dispose();
  };

  return true;
}

function revertToFallback(mount) {
  if (!mount || mount._fallbackApplied) return;
  mount._fallbackApplied = true;
  mount._destroy3D?.();
  if (typeof renderHero === "function") renderHero();
}
