"use client";
/**
 * Scène 3D du hero (et du footer, en mode nuit).
 *
 * Pas de modèle lourd : le massif est un photomontage de plans découpés,
 * comme une affiche suisse des années 30. Chaque plan est une crête générée
 * (déplacement du point milieu) puis ombrée en deux tons par un shader :
 * versant éclairé / versant à l'ombre, lignes d'ombre obliques, brume de vallée
 * et grain. La caméra avance vers le chalet posé sur l'arête au fil du scroll.
 *
 * Coût : 4 maillages plats + quelques triangles + un nuage de points.
 * Aucun GLB nécessaire ; si un vrai modèle du bâtiment arrive, le charger avec
 * useGLTF(url, true) (Draco) dans <Chalet /> et garder le reste.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

type Props = {
  /** Avancement 0 → 1 écrit par ScrollTrigger (ref : aucun re-render React). */
  progress: MutableRefObject<number>;
  /** Variante nocturne pour le footer (boucle narrative). */
  night?: boolean;
  /** Version allégée : mobile / tactile. */
  lite?: boolean;
  /** prefers-reduced-motion : une image fixe, pas d'animation. */
  still?: boolean;
  /** Mis à jour quand la scène a rendu sa première image. */
  onReady?: () => void;
};

/* ------------------------------------------------------------------ */
/* Palette (jour / nuit). Reprend les jetons de globals.css.           */
/* ------------------------------------------------------------------ */
const SKY = { day: "#16245a", night: "#070b1c" };

type Tone = { lit: string; shade: string; haze: string };
const LAYERS: {
  key: string;
  z: number;
  width: number;
  base: number;
  amp: number;
  seed: number;
  rough: number;
  slant: number;
  hazeDepth: number;
  day: Tone;
  night: Tone;
}[] = [
  {
    key: "far",
    z: -90,
    width: 240,
    base: 10,
    amp: 52,
    seed: 11,
    rough: 0.62,
    slant: 0.55,
    hazeDepth: 16,
    day: { lit: "#d9e3ee", shade: "#9fb3cf", haze: "#6f86b0" },
    night: { lit: "#26345e", shade: "#18224a", haze: "#121a3c" },
  },
  {
    key: "mid",
    z: -50,
    width: 170,
    base: 2,
    amp: 13,
    seed: 37,
    rough: 0.55,
    slant: 0.5,
    hazeDepth: 12,
    day: { lit: "#eef2f5", shade: "#b0c1d7", haze: "#c3d1e2" },
    night: { lit: "#34446f", shade: "#202b54", haze: "#1a2449" },
  },
  {
    key: "near",
    z: -24,
    width: 100,
    base: 1.2,
    amp: 6,
    seed: 5,
    rough: 0.5,
    slant: 0.45,
    hazeDepth: 9,
    day: { lit: "#f4f6f5", shade: "#c2cfde", haze: "#e2e9f0" },
    night: { lit: "#44557f", shade: "#28355e", haze: "#202b52" },
  },
];

/* ------------------------------------------------------------------ */
/* Génération des crêtes                                               */
/* ------------------------------------------------------------------ */
const N = 129; // 2^7 + 1 échantillons par crête

function rng(seed: number) {
  let s = seed % 2147483647;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Profil de crête alpin (déplacement du point milieu), normalisé 0..1. */
function ridgeProfile(seed: number, rough: number) {
  const r = rng(seed);
  const h = new Float32Array(N);
  h[0] = r();
  h[N - 1] = r();
  let step = N - 1;
  let amp = 1;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < N; i += step) h[i] = (h[i - half] + h[i + half]) / 2 + (r() - 0.5) * amp;
    amp *= rough;
    step = half;
  }
  let min = Infinity;
  let max = -Infinity;
  h.forEach((v) => ((min = Math.min(min, v)), (max = Math.max(max, v))));
  // puissance > 1 : sommets pointus, combes larges (silhouette alpine)
  return h.map((v) => Math.pow((v - min) / (max - min), 1.45));
}

/** Hauteur de crête à l'abscisse x (même formule que le shader). */
function ridgeAt(profile: Float32Array, width: number, base: number, amp: number, x: number) {
  const t = THREE.MathUtils.clamp((x / width + 0.5) * (N - 1), 0, N - 1);
  const i = Math.floor(t);
  const j = Math.min(i + 1, N - 1);
  return base + THREE.MathUtils.lerp(profile[i], profile[j], t - i) * amp;
}

/** Profils calculés une fois (déterministes) : partagés par la scène et la caméra. */
const PROFILES = LAYERS.map((l) => ridgeProfile(l.seed, l.rough));

/** Le chalet se pose sur le point le plus haut de la crête proche, à droite du centre. */
export const CHALET = (() => {
  const l = LAYERS[2];
  const prof = PROFILES[2];
  let x = 4;
  let y = -Infinity;
  for (let t = 2; t < 12; t += 0.25) {
    const h = ridgeAt(prof, l.width, l.base, l.amp, t);
    if (h > y) (y = h), (x = t);
  }
  return { x, y, z: l.z + 0.05 };
})();

/* ------------------------------------------------------------------ */
/* Shader d'ombrage deux tons                                          */
/* ------------------------------------------------------------------ */
const vert = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform float uRidge[${N}];
  uniform float uW, uBase, uAmp, uSlant, uHazeDepth, uNight, uTracks;
  uniform vec3 uLit, uShade, uHaze, uLitN, uShadeN, uHazeN;
  varying vec2 vPos;

  float ridgeAt(float x) {
    float t = clamp((x / uW + 0.5) * ${N - 1}.0, 0.0, ${N - 1}.0);
    int i = int(floor(t));
    int j = min(i + 1, ${N - 1});
    return uBase + mix(uRidge[i], uRidge[j], fract(t)) * uAmp;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float crest = ridgeAt(vPos.x);
    float depth = crest - vPos.y;
    // Les arêtes d'ombre descendent en oblique depuis chaque sommet
    float xs = vPos.x + depth * uSlant;
    float e = uW / ${N - 1}.0;
    float d = ridgeAt(xs + e) - ridgeAt(xs - e);
    // Soleil à gauche : un versant qui monte vers la droite est éclairé
    float lit = smoothstep(-0.015, 0.015, d);

    vec3 litC = mix(uLit, uLitN, uNight);
    vec3 shadeC = mix(uShade, uShadeN, uNight);
    vec3 hazeC = mix(uHaze, uHazeN, uNight);
    vec3 col = mix(shadeC, litC, lit);
    // les facettes ne vivent que sous la crête, puis se fondent dans un ton moyen
    col = mix(col, mix(shadeC, litC, 0.62), smoothstep(uHazeDepth * 0.25, uHazeDepth * 0.8, depth));

    // Traces de ski sur la pente du premier plan
    if (uTracks > 0.5) {
      float w = sin(vPos.x * 0.9 + depth * 0.15) * 0.35;
      float tr = abs(fract((depth + w) * 0.55) - 0.5);
      col = mix(col, shadeC, (1.0 - smoothstep(0.0, 0.02, tr)) * 0.5 * step(0.6, depth));
    }

    // Brume de vallée : sépare les plans comme des papiers découpés
    col = mix(col, hazeC, smoothstep(0.0, uHazeDepth, depth) * 0.9);
    // Grain photo
    col += (hash(gl_FragCoord.xy) - 0.5) * 0.04;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function makeMaterial(profile: Float32Array, o: {
  width: number; base: number; amp: number; slant: number; hazeDepth: number; day: Tone; night: Tone; tracks?: boolean;
}) {
  return new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uRidge: { value: Array.from(profile) },
      uW: { value: o.width },
      uBase: { value: o.base },
      uAmp: { value: o.amp },
      uSlant: { value: o.slant },
      uHazeDepth: { value: o.hazeDepth },
      uTracks: { value: o.tracks ? 1 : 0 },
      uNight: { value: 0 },
      uLit: { value: new THREE.Color(o.day.lit) },
      uShade: { value: new THREE.Color(o.day.shade) },
      uHaze: { value: new THREE.Color(o.day.haze) },
      uLitN: { value: new THREE.Color(o.night.lit) },
      uShadeN: { value: new THREE.Color(o.night.shade) },
      uHazeN: { value: new THREE.Color(o.night.haze) },
    },
  });
}

/** Plan découpé suivant la crête, rempli jusqu'à `bottom`. */
function ridgeGeometry(profile: Float32Array, width: number, base: number, amp: number, bottom: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, bottom);
  for (let i = 0; i < N; i++) shape.lineTo(-width / 2 + (i / (N - 1)) * width, base + profile[i] * amp);
  shape.lineTo(width / 2, bottom);
  shape.closePath();
  return new THREE.ShapeGeometry(shape, 1);
}

/* ------------------------------------------------------------------ */
/* Composants                                                          */
/* ------------------------------------------------------------------ */
function Massif({ night }: { night: boolean }) {
  const layers = useMemo(
    () =>
      LAYERS.map((l, i) => {
        const profile = PROFILES[i];
        return {
          ...l,
          profile,
          geometry: ridgeGeometry(profile, l.width, l.base, l.amp, -40),
          material: makeMaterial(profile, l),
        };
      }),
    [],
  );
  layers.forEach((l) => (l.material.uniforms.uNight.value = night ? 1 : 0));

  const near = layers[2];

  return (
    <group>
      {layers.map((l) => (
        <mesh key={l.key} geometry={l.geometry} material={l.material} position-z={l.z} />
      ))}
      <Forest profile={near.profile} layer={near} night={night} avoidX={CHALET.x} />
      <Chalet x={CHALET.x} y={CHALET.y} z={CHALET.z} night={night} />
      <Foreground night={night} />
    </group>
  );
}

/** Pente du premier plan, à 12°, avec traces de ski : c'est elle qui porte le titre. */
function Foreground({ night }: { night: boolean }) {
  const { geometry, material } = useMemo(() => {
    const width = 60;
    const r = rng(91);
    const tan = Math.tan(THREE.MathUtils.degToRad(12));
    // Profil linéaire légèrement bosselé, normalisé sur amp = width * tan(12°)
    const profile = new Float32Array(N).map((_, i) => i / (N - 1) + (r() - 0.5) * 0.004);
    const amp = width * tan;
    const base = -2.3 - (width / 2 - 10) * tan; // la ligne passe par y ≈ -2.3 en x = -10
    return {
      geometry: ridgeGeometry(profile, width, base, amp, -30),
      material: makeMaterial(profile, {
        width,
        base,
        amp,
        slant: 0,
        hazeDepth: 40,
        tracks: true,
        day: { lit: "#f7f8f8", shade: "#d3dde8", haze: "#e9eef2" },
        night: { lit: "#5a6b9c", shade: "#34426f", haze: "#2c3963" },
      }),
    };
  }, []);
  material.uniforms.uNight.value = night ? 1 : 0;
  return <mesh geometry={geometry} material={material} position-z={-4} />;
}

/** Sapins : triangles plats sombres sous la crête proche (un seul maillage). */
function Forest({
  profile,
  layer,
  night,
  avoidX,
}: {
  profile: Float32Array;
  layer: (typeof LAYERS)[number];
  night: boolean;
  avoidX: number;
}) {
  const geometry = useMemo(() => {
    const r = rng(7);
    const pos: number[] = [];
    for (let k = 0; k < 110; k++) {
      const x = -40 + r() * 80;
      if (Math.abs(x - avoidX) < 1.8) continue;
      const crest = ridgeAt(profile, layer.width, layer.base, layer.amp, x);
      const y = crest - 0.25 - Math.pow(r(), 1.6) * 2.6;
      const h = 0.55 + r() * 0.7;
      // deux étages par sapin : silhouette d'épicéa, pas de triangle de jeu vidéo
      for (const [t, wk] of [[0, 0.22], [0.38, 0.17]] as const) {
        const by = y + h * t;
        const w = h * wk;
        pos.push(x - w, by, 0, x + w, by, 0, x, by + h * (1 - t * 0.6), 0);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [profile, layer, avoidX]);
  return (
    <mesh geometry={geometry} position-z={layer.z + 0.02}>
      <meshBasicMaterial color={night ? "#0d1226" : "#22304a"} />
    </mesh>
  );
}

/** Le chalet : silhouette savoyarde découpée (neige, toit, pignon en arolle, balcon). */
function tri(a: [number, number], b: [number, number], c: [number, number]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...a, 0, ...b, 0, ...c, 0], 3));
  return g;
}

function Chalet({ x, y, z, night }: { x: number; y: number; z: number; night: boolean }) {
  const g = useMemo(
    () => ({
      snow: tri([-1.55, 0.98], [1.55, 0.98], [0, 1.78]),
      roof: tri([-1.45, 0.9], [1.45, 0.9], [0, 1.66]),
      gable: tri([-1.02, 0.98], [1.02, 0.98], [0, 1.5]),
    }),
    [],
  );
  const wood = night ? "#1d1620" : "#6b4426";
  const dark = night ? "#0a0d1a" : "#121417";
  const lit = night ? "#ffb35c" : "#c8873a";
  const glow = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    // Lueur qui respire très lentement : la maison est habitée
    if (glow.current) glow.current.uniforms.uA.value = (night ? 0.9 : 0.3) + Math.sin(clock.elapsedTime * 0.8) * 0.06;
  });
  return (
    <group position={[x, y - 0.3, z]}>
      <mesh position={[0, 0.65, -0.02]}>
        <planeGeometry args={[4, 2.6]} />
        <shaderMaterial
          ref={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ uA: { value: 0.3 } }}
          vertexShader={"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"}
          fragmentShader={"uniform float uA; varying vec2 vUv; void main(){ float d = length((vUv - 0.5) * vec2(1.0, 0.7)); float a = exp(-d * d * 26.0) * uA; gl_FragColor = vec4(vec3(0.78, 0.53, 0.23) * a, a); }"}
        />
      </mesh>
      {/* corps en bois d'arolle */}
      <mesh position={[0, 0.47, 0]}>
        <planeGeometry args={[2.04, 0.98]} />
        <meshBasicMaterial color={wood} />
      </mesh>
      {/* neige sur le toit, puis toit sombre, puis pignon */}
      <mesh geometry={g.snow} position-z={0.005}>
        <meshBasicMaterial color={night ? "#8796c2" : "#f7f8f8"} />
      </mesh>
      <mesh geometry={g.roof} position-z={0.01}>
        <meshBasicMaterial color={dark} />
      </mesh>
      <mesh geometry={g.gable} position-z={0.015}>
        <meshBasicMaterial color={wood} />
      </mesh>
      {/* balcon filant */}
      <mesh position={[0, 0.7, 0.02]}>
        <planeGeometry args={[2.3, 0.07]} />
        <meshBasicMaterial color={dark} />
      </mesh>
      {/* fenêtres : quatre baies au rez, deux au pignon */}
      {[-0.72, -0.24, 0.24, 0.72].map((wx) => (
        <mesh key={wx} position={[wx, 0.34, 0.02]}>
          <planeGeometry args={[0.24, 0.36]} />
          <meshBasicMaterial color={lit} toneMapped={false} />
        </mesh>
      ))}
      {[-0.2, 0.2].map((wx) => (
        <mesh key={wx} position={[wx, 1.12, 0.02]}>
          <planeGeometry args={[0.16, 0.22]} />
          <meshBasicMaterial color={lit} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Neige qui tombe : un seul nuage de points animé dans le shader. */
function Snow({ count, still }: { count: number; still: boolean }) {
  const { geometry, material } = useMemo(() => {
    const r = rng(3);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -18 + r() * 36;
      pos[i * 3 + 1] = -6 + r() * 22;
      pos[i * 3 + 2] = -26 + r() * 34;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime, uPx;
        varying float vA;
        void main() {
          vec3 p = position;
          p.y = mod(p.y - uTime * (0.35 + aSeed * 0.5) + 6.0, 22.0) - 6.0;
          p.x += sin(uTime * 0.6 + aSeed * 6.283) * 0.35;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (1.2 + aSeed * 2.2) * uPx * (14.0 / -mv.z);
          vA = 0.45 + aSeed * 0.45;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(vec3(0.97), vA * (1.0 - smoothstep(0.3, 0.5, d)));
        }`,
    });
    return { geometry: g, material: m };
  }, [count]);
  const { gl } = useThree();
  useFrame((_, dt) => {
    material.uniforms.uPx.value = gl.getPixelRatio();
    if (!still) material.uniforms.uTime.value += Math.min(dt, 0.05);
  });
  return <points geometry={geometry} material={material} />;
}

/** Travelling : la caméra avance et monte vers le chalet avec le scroll. */
function CameraRig({ progress, still }: { progress: MutableRefObject<number>; still: boolean }) {
  const smooth = useRef(0);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, pointer }, dt) => {
    const target = still ? 0 : progress.current;
    // Amorti exponentiel indépendant du framerate
    smooth.current = THREE.MathUtils.damp(smooth.current, target, 4, dt);
    const p = smooth.current;
    const e = p * p * (3 - 2 * p); // smoothstep : départ et arrivée doux
    const px = still ? 0 : pointer.x * 0.35;
    const py = still ? 0 : pointer.y * 0.2;
    // départ : vue large du massif ; arrivée : à quelques mètres du chalet
    camera.position.set(
      THREE.MathUtils.lerp(0, CHALET.x * 0.75, e) + px,
      THREE.MathUtils.lerp(1.4, CHALET.y + 0.9, e) + py,
      THREE.MathUtils.lerp(14, CHALET.z + 13, e),
    );
    look.set(THREE.MathUtils.lerp(0.5, CHALET.x, e), THREE.MathUtils.lerp(6.5, CHALET.y + 0.3, e), THREE.MathUtils.lerp(-40, CHALET.z, e));
    camera.lookAt(look);
  });
  return null;
}

export default function SlopeScene({ progress, night = false, lite = false, still = false, onReady }: Props) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={lite ? 1 : [1, 1.75]}
      frameloop={still ? "demand" : "always"}
      gl={{ antialias: !lite, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 32, near: 0.5, far: 200, position: [0, 1.2, 14] }}
      onCreated={({ gl }) => {
        gl.setClearColor(night ? SKY.night : SKY.day);
        // première image prête : le hero peut retirer son voile
        requestAnimationFrame(() => onReady?.());
      }}
      aria-hidden
    >
      <CameraRig progress={progress} still={still} />
      <Massif night={night} />
      {night && <Stars />}
      <Snow count={lite ? 160 : 520} still={still} />
    </Canvas>
  );
}

/** Ciel étoilé de la variante nocturne (footer). */
function Stars() {
  const geometry = useMemo(() => {
    const r = rng(19);
    const pos = new Float32Array(700 * 3);
    for (let i = 0; i < 700; i++) {
      pos[i * 3] = -160 + r() * 320;
      pos[i * 3 + 1] = 10 + r() * 80;
      pos[i * 3 + 2] = -120;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#e9eef7" size={0.35} sizeAttenuation transparent opacity={0.75} />
    </points>
  );
}
