"use client";
/**
 * Galerie 3D : les expériences sont des cartes posées sur un anneau.
 * - L'anneau tourne avec le scroll (progress 0 → 1 : de la 1re à la dernière carte).
 * - La vitesse de scroll courbe les cartes (inertie visible, comme un papier).
 * - Au survol, l'image ondule légèrement autour du pointeur (shader de distorsion).
 * - Les cartes hors face passent en monochrome bleuté : l'œil va à celle de face.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { EXPERIENCES } from "./data";

type Props = {
  progress: MutableRefObject<number>;
  velocity: MutableRefObject<number>;
  onHover?: (i: number | null) => void;
  /** Première image rendue : l'affiche posée dessous peut s'effacer. */
  onReady?: () => void;
  /** Section à l'écran : sinon la boucle de rendu s'arrête. */
  active: boolean;
};

// Les textures partent dès que ce module est chargé (avant l'épinglage)
useTexture.preload(EXPERIENCES.map((e) => e.image));

const N = EXPERIENCES.length;
const R = 6; // rayon de l'arc
const STEP = THREE.MathUtils.degToRad(30); // écart entre cartes : la voisine reste dans le champ
const W = 2.4;
const H = 3.2;

const vert = /* glsl */ `
  uniform float uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // courbure liée à la vitesse de scroll : les bords reculent
    p.z -= uBend * (p.x * p.x) * 0.35;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uImgAspect, uHover, uFront, uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  void main() {
    // object-fit: cover dans une carte 3:4
    float planeAspect = ${(W / H).toFixed(4)};
    vec2 uv = vUv - 0.5;
    if (uImgAspect > planeAspect) uv.x *= planeAspect / uImgAspect;
    else uv.y *= uImgAspect / planeAspect;
    uv += 0.5;
    // ondulation autour du pointeur, au survol
    float d = distance(vUv, uMouse);
    float wave = sin(d * 28.0 - uTime * 3.0) * 0.012 * uHover * smoothstep(0.45, 0.0, d);
    uv += normalize(vUv - uMouse + 1e-4) * wave;
    // léger zoom au survol
    uv = (uv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;
    vec3 c = texture2D(uTex, uv).rgb;
    // hors face : monochrome bleu d'altitude
    float g = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 mono = mix(vec3(0.086, 0.141, 0.353), vec3(0.95, 0.96, 0.955), g);
    gl_FragColor = vec4(mix(mono, c, uFront), 1.0);
    #include <colorspace_fragment>
  }
`;

function Card({ i, tex, onHover }: { i: number; tex: THREE.Texture; onHover?: (i: number | null) => void }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTex: { value: tex },
          uImgAspect: { value: (() => { const im = tex.image as { width?: number; height?: number } | undefined; return im?.width && im?.height ? im.width / im.height : 1.5; })() },
          uHover: { value: 0 },
          uFront: { value: 0 },
          uTime: { value: 0 },
          uBend: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        },
      }),
    [tex],
  );
  const hover = useRef(0);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    mat.uniforms.uTime.value += dt;
    mat.uniforms.uHover.value = THREE.MathUtils.damp(mat.uniforms.uHover.value, hover.current, 6, dt);
    // « de face » = la normale de la carte pointe vers la caméra
    if (mesh.current) {
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.current.getWorldQuaternion(new THREE.Quaternion()));
      mat.uniforms.uFront.value = THREE.MathUtils.smoothstep(n.z, 0.75, 0.98);
    }
  });
  const angle = i * STEP;
  return (
    <mesh
      ref={mesh}
      position={[Math.sin(angle) * R, 0, Math.cos(angle) * R]}
      rotation={[0, angle, 0]}
      material={mat}
      onPointerMove={(e) => e.uv && mat.uniforms.uMouse.value.copy(e.uv)}
      onPointerOver={() => ((hover.current = 1), onHover?.(i))}
      onPointerOut={() => ((hover.current = 0), onHover?.(null))}
      userData={{ bend: mat.uniforms.uBend }}
    >
      <planeGeometry args={[W, H, 32, 32]} />
    </mesh>
  );
}

function Ring({ progress, velocity, onHover, onReady }: Omit<Props, "active">) {
  const first = useRef(false);
  const textures = useTexture(EXPERIENCES.map((e) => e.image));
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  const group = useRef<THREE.Group>(null);
  const rot = useRef(0);
  const bend = useRef(0);
  useFrame(({ pointer }, dt) => {
    if (!first.current) {
      first.current = true;
      requestAnimationFrame(() => onReady?.());
    }
    // carte i de face quand progress = i / (N - 1)
    const target = -progress.current * (N - 1) * STEP;
    rot.current = THREE.MathUtils.damp(rot.current, target, 5, dt);
    bend.current = THREE.MathUtils.damp(bend.current, THREE.MathUtils.clamp(velocity.current / 2500, -1, 1), 4, dt);
    if (group.current) {
      group.current.rotation.y = rot.current;
      // le pointeur incline légèrement l'anneau : la profondeur se lit
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.06, 3, dt);
      group.current.children.forEach((c) => {
        const u = (c as THREE.Mesh).userData.bend as { value: number } | undefined;
        if (u) u.value = bend.current;
      });
    }
  });
  return (
    <group ref={group}>
      {textures.map((t, i) => (
        <Card key={i} i={i} tex={t} onHover={onHover} />
      ))}
    </group>
  );
}

function Rig() {
  const { camera, size } = useThree();
  // recule la caméra sur les écrans étroits pour garder la carte entière
  const z = size.width / size.height < 0.9 ? R + 10 : R + 7.5;
  camera.position.set(0, 0, z);
  camera.lookAt(0, 0, 0);
  return null;
}

export default function ExperienceRing({ active, ...props }: Props) {
  return (
    <Canvas
      // hors écran : plus aucune image calculée (les séquences vidéo gardent le GPU)
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ fov: 40, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <Rig />
      <Ring {...props} />
    </Canvas>
  );
}
