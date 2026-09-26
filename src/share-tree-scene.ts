import * as THREE from "three";
import { createShareQr } from "./share-qr.mjs";

export type ShareTreeView = "tree" | "qr";
export type ShareTreeSeason = "spring" | "summer" | "autumn";

type SceneOptions = {
  canvas: HTMLCanvasElement;
  url: string;
  season: ShareTreeSeason;
  onStable: (view: ShareTreeView | "transition") => void;
  onCapture: (dataUrl: string | null) => void;
};

type Leaf = {
  x: number;
  z: number;
  height: number;
  size: number;
  rotation: THREE.Quaternion;
  color: number;
  satellite: boolean;
};

const BACKGROUND = "#f6f1e7";
const PALETTES: Record<ShareTreeSeason, string[]> = {
  spring: ["#527d4c", "#648e56", "#769b61", "#8cab72", "#aac48d"],
  summer: ["#2f683c", "#3d7e45", "#529348", "#6aa64f", "#88b968"],
  autumn: ["#a35532", "#ba6c38", "#cf873d", "#daa149", "#e3b966"],
};
const GRASS: Record<ShareTreeSeason, string> = {
  spring: "#b7c998",
  summer: "#a9bd86",
  autumn: "#c8bb8b",
};

function seededRandom(value: string) {
  let seed = 2166136261;
  for (let i = 0; i < value.length; i++) {
    seed = Math.imul(seed ^ value.charCodeAt(i), 16777619);
  }
  return () => {
    seed += 0x6d2b79f5;
    let x = seed;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, value: number) => {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Five folded blades make each instance read as foliage, even at small sizes. */
function createLeafClusterGeometry() {
  const positions: number[] = [];
  const point = (angle: number, along: number, sideways: number, y: number) => [
    Math.cos(angle) * along - Math.sin(angle) * sideways,
    y,
    Math.sin(angle) * along + Math.cos(angle) * sideways,
  ];
  const triangle = (a: number[], b: number[], c: number[]) => positions.push(...a, ...b, ...c);
  for (let leaf = 0; leaf < 5; leaf++) {
    const angle = leaf * 2.399963;
    const reach = leaf % 2 ? 0.64 : 0.74;
    const tilt = (leaf % 3 - 1) * 0.13;
    const base = point(angle, -0.12, 0, -0.07);
    const leftShoulder = point(angle, 0.13, -0.16, tilt * 0.2 - 0.03);
    const leftEdge = point(angle, 0.39, -0.2, tilt * 0.6);
    const tip = point(angle, reach, 0, tilt + 0.03);
    const rightEdge = point(angle, 0.39, 0.2, tilt * 0.6);
    const rightShoulder = point(angle, 0.13, 0.16, tilt * 0.2 - 0.03);
    const ridge = point(angle, 0.31, 0, tilt * 0.4 + 0.09);
    // Six triangles retain the central ridge and a pointed leaf silhouette.
    triangle(base, leftShoulder, ridge);
    triangle(leftShoulder, leftEdge, ridge);
    triangle(leftEdge, tip, ridge);
    triangle(tip, rightEdge, ridge);
    triangle(rightEdge, rightShoulder, ridge);
    triangle(rightShoulder, base, ridge);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** A single 3D canopy: each dark QR module has its own branch of foliage. */
export function createShareTreeScene({
  canvas,
  url,
  season: initialSeason,
  onStable,
  onCapture,
}: SceneOptions) {
  const qr = createShareQr(url);
  const random = seededRandom(url);
  const unit = 6.2 / qr.size;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const camera = new THREE.OrthographicCamera(-5.3, 5.3, 5.3, -5.3, 0.1, 60);
  const treeTarget = new THREE.Vector3(0, 2.45, 0);
  camera.position.set(10, 10.6, 12);
  camera.lookAt(treeTarget);
  const treeRotation = camera.quaternion.clone();
  camera.position.set(0, 20, 0);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0.7, 0);
  const qrRotation = camera.quaternion.clone();
  const cameraTarget = new THREE.Vector3();
  const cameraOffset = new THREE.Vector3();

  scene.add(new THREE.HemisphereLight("#fffbee", "#b4b99b", 2.3));
  const sun = new THREE.DirectionalLight("#fff5da", 3.0);
  sun.position.set(-6, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -6;
  sun.shadow.camera.far = 35;
  sun.shadow.normalBias = 0.025;
  sun.shadow.bias = -0.0001;
  sun.shadow.radius = 3;
  sun.target.position.set(0, 2.5, 0);
  scene.add(sun, sun.target);

  const environment = new THREE.Group();
  scene.add(environment);
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: "#786046",
    roughness: 1,
    flatShading: true,
    transparent: true,
  });
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: GRASS[initialSeason],
    roughness: 1,
    transparent: true,
  });
  const earthMaterial = new THREE.MeshStandardMaterial({
    color: "#c5bea2",
    roughness: 1,
    transparent: true,
  });
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.2, 6.8),
    [earthMaterial, earthMaterial, grassMaterial, earthMaterial, earthMaterial, earthMaterial],
  );
  base.position.y = -0.08;
  base.receiveShadow = true;
  environment.add(base);

  const woodSegments: { start: THREE.Vector3; end: THREE.Vector3; radius: number }[] = [];
  const segment = (a: number[], b: number[], radius: number) => {
    woodSegments.push({
      start: new THREE.Vector3(...(a as [number, number, number])),
      end: new THREE.Vector3(...(b as [number, number, number])),
      radius,
    });
  };
  segment([0, 0.01, 0], [-0.16, 1.25, 0.03], 0.33);
  segment([-0.16, 1.25, 0.03], [0.04, 2.55, -0.1], 0.27);
  segment([0.04, 2.55, -0.1], [-0.12, 3.8, 0.07], 0.2);
  segment([-0.12, 3.8, 0.07], [0.18, 5.15, -0.04], 0.13);
  segment([0.18, 5.15, -0.04], [-0.08, 6.15, 0.09], 0.065);
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    segment(
      [Math.cos(angle) * 0.08, 0.28, Math.sin(angle) * 0.08],
      [Math.cos(angle) * (0.68 + random() * 0.25), 0.035, Math.sin(angle) * (0.68 + random() * 0.25)],
      0.12,
    );
  }
  for (let tier = 0; tier < 3; tier++) {
    const count = tier === 0 ? 7 : 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + tier * 0.74 + (random() - 0.5) * 0.4;
      const height = 2.2 + tier * 0.83 + random() * 0.4;
      const reach = 2.35 - tier * 0.38 + random() * 0.45;
      const middle = [Math.cos(angle) * reach * 0.5, height + 0.7, Math.sin(angle) * reach * 0.5];
      const end = [Math.cos(angle) * reach, height + 1.3, Math.sin(angle) * reach];
      segment([0, height, 0], middle, 0.115 - tier * 0.02);
      segment(middle, end, 0.065 - tier * 0.009);
      for (const side of [-1, 1]) {
        segment(
          end,
          [end[0] + Math.cos(angle + side * 0.55) * 0.65, end[1] + 0.7 + random() * 0.45, end[2] + Math.sin(angle + side * 0.55) * 0.65],
          0.027,
        );
      }
    }
  }
  const wood = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.7, 1, 1, 7),
    woodMaterial,
    woodSegments.length,
  );
  const transform = new THREE.Object3D();
  const direction = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  woodSegments.forEach(({ start, end, radius }, index) => {
    direction.subVectors(end, start);
    transform.position.addVectors(start, end).multiplyScalar(0.5);
    transform.quaternion.setFromUnitVectors(up, direction.clone().normalize());
    transform.scale.set(radius, direction.length(), radius);
    transform.updateMatrix();
    wood.setMatrixAt(index, transform.matrix);
  });
  wood.castShadow = true;
  wood.receiveShadow = true;
  environment.add(wood);

  const grassTufts = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.075, 0.3, 3),
    grassMaterial,
    100,
  );
  for (let i = 0; i < 100; i++) {
    const x = (random() - 0.5) * 6.2;
    const z = (random() - 0.5) * 6.2;
    const scale = 0.45 + random() * 0.65;
    transform.position.set(x, 0.035 + 0.12 * scale, z);
    transform.rotation.set((random() - 0.5) * 0.3, random() * Math.PI, (random() - 0.5) * 0.3);
    transform.scale.set(scale, scale, scale);
    transform.updateMatrix();
    grassTufts.setMatrixAt(i, transform.matrix);
  }
  environment.add(grassTufts);

  const leaves: Leaf[] = [];
  const modules: Leaf[] = [];
  for (let row = 0; row < qr.size; row++) {
    for (let col = 0; col < qr.size; col++) {
      if (!qr.data[row * qr.size + col]) continue;
      const x = (col - (qr.size - 1) / 2) * unit;
      const z = (row - (qr.size - 1) / 2) * unit;
      const dome = Math.sqrt(Math.max(0, 1 - (x * x + z * z) / 21));
      const leaf: Leaf = {
        x,
        z,
        height: 3.65 + dome * 2.55 + random() * 0.45,
        size: unit * (1.1 + random() * 0.65),
        rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(random() * 2, random() * 3, random() * 2)),
        color: Math.floor(random() * 5),
        satellite: false,
      };
      modules.push(leaf);
      leaves.push(leaf);
      for (let i = 0; i < 2; i++) {
        leaves.push({
          x: x + (random() - 0.5) * unit * 1.25,
          z: z + (random() - 0.5) * unit * 1.25,
          height: leaf.height - 0.25 - random() * 0.8,
          size: unit * (0.9 + random() * 0.8),
          rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(random() * 3, random() * 3, random() * 3)),
          color: Math.floor(random() * 5),
          satellite: true,
        });
      }
    }
  }
  const leafMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    roughness: 1,
    flatShading: true,
    transparent: true,
  });
  const foliage = new THREE.InstancedMesh(createLeafClusterGeometry(), leafMaterial, leaves.length);
  foliage.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  foliage.castShadow = true;
  foliage.receiveShadow = true;
  // The canopy moves between distant positions, so its initial bounds are not reused.
  foliage.frustumCulled = false;
  scene.add(foliage);
  const moduleMaterial = new THREE.MeshBasicMaterial({
    color: "#264632",
    toneMapped: false,
    transparent: true,
    opacity: 0,
  });
  const qrModules = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), moduleMaterial, modules.length);
  qrModules.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  qrModules.frustumCulled = false;
  scene.add(qrModules);

  let season = initialSeason;
  let progress = 0;
  let target: ShareTreeView = "tree";
  let frame = 0;
  let disposed = false;
  let width = 1;
  let height = 1;
  const color = new THREE.Color();
  const identity = new THREE.Quaternion();
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function paintSeason() {
    const palette = PALETTES[season];
    leaves.forEach((leaf, index) => {
      foliage.setColorAt(index, color.set(palette[leaf.color]));
    });
    if (foliage.instanceColor) foliage.instanceColor.needsUpdate = true;
    grassMaterial.color.set(GRASS[season]);
  }

  function apply(value: number) {
    const flatten = smooth(0.05, 0.94, value);
    const moduleReveal = smooth(0.45, 0.94, value);
    const leafFade = 1 - smooth(0.7, 0.99, value);
    leafMaterial.opacity = leafFade;
    foliage.visible = value < 1;
    foliage.castShadow = value < 0.4;
    moduleMaterial.opacity = moduleReveal;
    qrModules.visible = value > 0.45;
    const environmentFade = 1 - smooth(0.35, 0.88, value);
    environment.visible = environmentFade > 0;
    woodMaterial.opacity = environmentFade;
    grassMaterial.opacity = environmentFade;
    earthMaterial.opacity = environmentFade;

    leaves.forEach((leaf, index) => {
      const scale = leaf.size * (leaf.satellite ? 1 - smooth(0.3, 0.88, value) : mix(1, 0.68, flatten));
      transform.position.set(leaf.x, mix(leaf.height, 0.7, flatten), leaf.z);
      transform.quaternion.copy(leaf.rotation).slerp(identity, flatten);
      transform.scale.set(scale, scale * mix(0.78, 0.05, flatten), scale);
      transform.updateMatrix();
      foliage.setMatrixAt(index, transform.matrix);
    });
    foliage.instanceMatrix.needsUpdate = true;
    modules.forEach((leaf, index) => {
      transform.position.set(leaf.x, mix(leaf.height, 0.7, flatten), leaf.z);
      transform.quaternion.copy(leaf.rotation).slerp(identity, flatten);
      const side = unit * mix(0.66, 1.006, moduleReveal);
      transform.scale.set(side, mix(unit * 0.48, 0.025, flatten), side);
      transform.updateMatrix();
      qrModules.setMatrixAt(index, transform.matrix);
    });
    qrModules.instanceMatrix.needsUpdate = true;

    camera.quaternion.copy(treeRotation).slerp(qrRotation, value);
    cameraTarget.set(0, mix(treeTarget.y, 0.7, value), 0);
    cameraOffset.set(0, 0, 18).applyQuaternion(camera.quaternion);
    camera.position.copy(cameraTarget).add(cameraOffset);
    // Preserve the QR quiet zone and a 46px mobile gutter for the view control.
    const shortestSide = Math.min(width, height);
    const padding = Math.min(46, shortestSide * 0.2);
    const qrSpan = Math.max(
      unit * (qr.size + 13.5),
      6.2 / (1 - (padding * 2) / shortestSide),
    );
    const span = mix(11.4, qrSpan, value);
    const aspect = width / height;
    camera.left = -span * Math.max(1, aspect) / 2;
    camera.right = span * Math.max(1, aspect) / 2;
    camera.top = span * Math.max(1, 1 / aspect) / 2;
    camera.bottom = -span * Math.max(1, 1 / aspect) / 2;
    camera.updateProjectionMatrix();
  }

  function render() {
    if (!disposed) renderer.render(scene, camera);
  }

  function captureTree() {
    if (disposed) return;
    // Capture a stable tree even when the user changes season while viewing QR.
    const restore = progress;
    if (restore !== 0) apply(0);
    render();
    let image: string | null = null;
    try {
      image = canvas.toDataURL("image/png");
    } catch {
      // Rendering can still work when a browser disallows canvas export.
    }
    if (restore !== 0) {
      apply(restore);
      render();
    }
    onCapture(image);
  }

  function setView(view: ShareTreeView) {
    if (disposed || (target === view && !frame)) return;
    target = view;
    cancelAnimationFrame(frame);
    frame = 0;
    const end = view === "qr" ? 1 : 0;
    const start = progress;
    if (motion.matches || start === end) {
      progress = end;
      apply(progress);
      render();
      onStable(view);
      return;
    }
    onStable("transition");
    const started = performance.now();
    const duration = Math.max(300, Math.abs(end - start) * 1250);
    function animate(now: number) {
      if (disposed) return;
      const t = Math.min(1, (now - started) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      progress = mix(start, end, eased);
      apply(progress);
      render();
      if (t < 1) frame = requestAnimationFrame(animate);
      else {
        frame = 0;
        onStable(view);
      }
    }
    frame = requestAnimationFrame(animate);
  }

  function resize(nextWidth: number, nextHeight: number) {
    if (disposed || nextWidth <= 0 || nextHeight <= 0) return;
    const changed = width !== nextWidth || height !== nextHeight;
    width = nextWidth;
    height = nextHeight;
    renderer.setSize(width, height, false);
    apply(progress);
    render();
    if (changed && !frame) captureTree();
  }

  function setSeason(next: ShareTreeSeason) {
    if (disposed || season === next) return;
    season = next;
    paintSeason();
    captureTree();
  }

  function reduceMotion() {
    if (motion.matches && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      progress = target === "qr" ? 1 : 0;
      apply(progress);
      render();
      onStable(target);
    }
  }
  motion.addEventListener("change", reduceMotion);
  paintSeason();
  const bounds = canvas.getBoundingClientRect();
  resize(bounds.width || 400, bounds.height || 400);
  onStable("tree");

  return {
    setView,
    setSeason,
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      motion.removeEventListener("change", reduceMotion);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          const items = Array.isArray(object.material) ? object.material : [object.material];
          items.forEach((material) => materials.add(material));
          if (object instanceof THREE.InstancedMesh) object.dispose();
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      sun.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      scene.clear();
    },
  };
}

export type ShareTreeScene = ReturnType<typeof createShareTreeScene>;
