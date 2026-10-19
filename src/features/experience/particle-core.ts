import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { TIER_CONFIG } from "./quality";
import { particleFragmentShader, particleVertexShader } from "./shaders/particles";

const BASE_FOV = 60;
/** Narrowest aspect that keeps New Era's framing; below it the horizontal FOV is held. */
const MIN_ASPECT = 0.8;

/**
 * Vertical FOV for a given aspect. New Era framed for landscape windows; on
 * portrait screens the sphere overflowed the width, so hold the horizontal FOV
 * at the MIN_ASPECT value by widening the vertical one.
 */
export const fovFor = (aspect: number): number => {
  if (aspect >= MIN_ASPECT) return BASE_FOV;
  const halfTan = Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * (MIN_ASPECT / aspect);
  return THREE.MathUtils.radToDeg(2 * Math.atan(halfTan));
};

export interface ParticleRig {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  particles: THREE.Points;
  material: THREE.ShaderMaterial;
  /** Renders one frame through the post-processing composer. */
  render: () => void;
  /** Camera aspect/FOV, renderer, composer and bloom sizes. */
  resize: (w: number, h: number) => void;
  /** Removes the canvas, disposes everything and releases the GPU context. */
  dispose: () => void;
}

export interface ParticleRigOptions {
  container: HTMLElement;
  tier: "high" | "low";
  /** True: no scene background, so the page shows through the alpha canvas. */
  transparent: boolean;
  /** Called when the GPU drops the context (not on our own dispose). */
  onContextLost: () => void;
}

/**
 * The particle sphere's setup, sizing and teardown, shared by every scene that
 * shows it: renderer, scene, camera, the dense SphereGeometry drawn as Points,
 * the particle shader and the composer (plus UnrealBloom on the high tier,
 * opaque canvases only).
 * Per-frame logic (uniforms, camera path) stays with the caller.
 */
export const createParticleRig = ({ container, tier, transparent, onContextLost }: ParticleRigOptions): ParticleRig => {
  const config = TIER_CONFIG[tier];

  let w = Math.max(1, container.clientWidth);
  let h = Math.max(1, container.clientHeight);

  const scene = new THREE.Scene();
  if (!transparent) {
    // Clear to the page --bg token so the stage hands off to the next section
    // without a seam. (New Era's aurora pass was dropped: this Color background
    // force-clears the frame, so the aurora was never visible.)
    const pageBg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    scene.background = new THREE.Color(pageBg || "#07070a");
  }

  const camera = new THREE.PerspectiveCamera(fovFor(w / h), w / h, 0.1, 1000);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.maxDpr));
  renderer.setSize(w, h);
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);

  const handleContextLost = (e: Event) => {
    e.preventDefault();
    onContextLost();
  };
  renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

  // Dense SphereGeometry rendered as Points — the moiré rings come for free.
  const geometry = new THREE.SphereGeometry(4.2, config.widthSegments, config.heightSegments);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0.0 },
      uIntro: { value: 0.0 },
      uFade: { value: 1 },
      uDim: { value: w < 640 ? 0.45 : 1 },
      uChart: { value: 0 },
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geometry, material);
  // Keep visible when stretched far below the original bounding sphere.
  particles.frustumCulled = false;
  scene.add(particles);

  // --- POST-PROCESSING ---
  const composer = new EffectComposer(renderer);

  const renderFg = new RenderPass(scene, camera);
  composer.addPass(renderFg);

  // Bloom (high tier only) runs at half resolution. The composer resizes
  // every pass to full size, so re-apply the half size after each resize.
  // Skipped on transparent canvases: UnrealBloom writes its glow into the
  // alpha channel, which paints a grey haze over the whole canvas box.
  const bloomPass = config.bloom && !transparent ? new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 1.2, 0.5, 0.05) : null;
  const sizeBloom = () => {
    const dpr = renderer.getPixelRatio();
    bloomPass?.setSize((w * dpr) / 2, (h * dpr) / 2);
  };
  if (bloomPass) {
    composer.addPass(bloomPass);
    sizeBloom();
  }

  const resize = (nextW: number, nextH: number) => {
    w = Math.max(1, nextW);
    h = Math.max(1, nextH);
    material.uniforms.uDim.value = w < 640 ? 0.45 : 1;
    camera.aspect = w / h;
    camera.fov = fovFor(w / h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    sizeBloom();
  };

  const dispose = () => {
    renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.remove();
    geometry.dispose();
    material.dispose();
    bloomPass?.dispose();
    composer.dispose();
    // Release the GPU context now rather than waiting for GC (the listener
    // above is already gone, so this doesn't trigger the "off" fallback).
    renderer.forceContextLoss();
    renderer.dispose();
  };

  return { renderer, scene, camera, particles, material, render: () => composer.render(), resize, dispose };
};
