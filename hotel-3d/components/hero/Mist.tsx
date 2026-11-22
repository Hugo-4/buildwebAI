"use client";
/**
 * Brume de montagne (WebGL) : un plan plein écran dont le shader peint un
 * brouillard en bruit fractal qui dérive lentement. `progress` (0 → 1, lié au
 * scroll) le fait monter depuis le bas jusqu'à couvrir le titre, qui s'y dissout.
 *
 * Un seul quad, un fragment shader ; aucune texture. Le canvas est transparent
 * et ne tourne que lorsque le hero est à l'écran.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, type MutableRefObject } from "react";
import * as THREE from "three";

type Props = { progress: MutableRefObject<number>; active: boolean; still?: boolean };

const frag = /* glsl */ `
  precision highp float;
  uniform float uTime, uProgress, uAspect;
  varying vec2 vUv;

  // bruit de valeur + fbm (5 octaves) : brume douce, sans motif visible
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    float t = uTime * 0.045;
    // deux couches qui dérivent en sens contraire : la brume respire
    float n = fbm(p * 1.6 + vec2(t, -t * 0.4)) * 0.6 + fbm(p * 3.4 + vec2(-t * 1.3, t * 0.2)) * 0.4;
    // ligne de brume : monte avec le scroll (au repos, un voile au ras du bas)
    float line = mix(0.18, 1.25, uProgress);
    float edge = smoothstep(line, line - 0.45, vUv.y + (n - 0.5) * 0.55);
    float a = clamp(edge * (0.55 + n * 0.6), 0.0, 1.0);
    // couleur : blanc de neige légèrement bleuté
    gl_FragColor = vec4(vec3(0.965, 0.97, 0.975), a);
  }
`;

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

function Fog({ progress, still }: { progress: MutableRefObject<number>; still?: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uAspect: { value: 1.6 } },
      }),
    [],
  );
  useFrame(({ size }, dt) => {
    if (!still) mat.uniforms.uTime.value += dt;
    mat.uniforms.uAspect.value = size.width / size.height;
    // amorti : la brume suit le scroll sans à-coup
    mat.uniforms.uProgress.value = THREE.MathUtils.damp(mat.uniforms.uProgress.value, progress.current, 5, dt);
  });
  return (
    <mesh material={mat} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function Mist({ progress, active, still }: Props) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={0.75} // brume floue par nature : un quart des pixels suffit
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: false, premultipliedAlpha: false }}
      aria-hidden
    >
      <Fog progress={progress} still={still} />
    </Canvas>
  );
}
