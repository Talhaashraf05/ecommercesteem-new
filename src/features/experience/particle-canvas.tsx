"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { subscribeToTicker } from "@/lib/animation/ticker";

import { experienceProgress } from "./progress";
import { TIER_CONFIG } from "./quality";
import { backgroundFragmentShader, backgroundVertexShader } from "./shaders/background";
import { particleFragmentShader, particleVertexShader } from "./shaders/particles";
import { cameraAt, particleFade } from "./timeline";

const BASE_FOV = 60;
/** Narrowest aspect that keeps New Era's framing; below it the horizontal FOV is held. */
const MIN_ASPECT = 0.8;

/**
 * Vertical FOV for a given aspect. New Era framed for landscape windows; on
 * portrait screens the sphere overflowed the width, so hold the horizontal FOV
 * at the MIN_ASPECT value by widening the vertical one.
 */
const fovFor = (aspect: number): number => {
  if (aspect >= MIN_ASPECT) return BASE_FOV;
  const halfTan = Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * (MIN_ASPECT / aspect);
  return THREE.MathUtils.radToDeg(2 * Math.atan(halfTan));
};

export interface ParticleCanvasProps {
  tier: "high" | "low";
  /** False while the section is off-screen; the render loop idles. */
  active: React.RefObject<boolean>;
  /** Called when the GPU drops the context — the parent falls back to the gradient. */
  onContextLost: () => void;
}

/**
 * WebGL backdrop for the home experience, ported from New Era's particle canvas:
 * an aurora shader + the scroll-driven particle morph + (high tier) UnrealBloom.
 *
 * Progress is read from `experienceProgress` (section-relative, legacy units),
 * written each frame by ExperienceSection — never from document scroll. Sized to
 * its container (the sticky stage), not the window.
 */
export const ParticleCanvas = ({ tier, active, onContextLost }: ParticleCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onContextLostRef = useRef(onContextLost);

  useEffect(() => {
    onContextLostRef.current = onContextLost;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const config = TIER_CONFIG[tier];

    let w = Math.max(1, container.clientWidth);
    let h = Math.max(1, container.clientHeight);

    const scene = new THREE.Scene();
    // Clear to the page --bg token so the stage hands off to the next section
    // without a seam. (A Color background force-clears this pass, so — as in
    // New Era — the aurora pass below ends up covered by it.)
    const pageBg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    scene.background = new THREE.Color(pageBg || "#07070a");

    const camera = new THREE.PerspectiveCamera(fovFor(w / h), w / h, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.maxDpr));
    renderer.setSize(w, h);
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      onContextLostRef.current();
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    // --- AURORA BACKGROUND SETUP ---
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(w, h) },
        color1: { value: new THREE.Color("#dc3326") },
        color2: { value: new THREE.Color("#5a0f0a") },
      },
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      depthWrite: false,
    });
    const bgQuad = new THREE.Mesh(bgGeometry, bgMaterial);
    bgScene.add(bgQuad);

    // Dense SphereGeometry rendered as Points — the moiré rings come for free.
    const geometry = new THREE.SphereGeometry(4.2, config.widthSegments, config.heightSegments);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0.0 },
        uIntro: { value: 0.0 },
        uFade: { value: 1 },
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

    const renderBg = new RenderPass(bgScene, bgCamera);
    composer.addPass(renderBg);

    const renderFg = new RenderPass(scene, camera);
    renderFg.clear = false;
    renderFg.clearDepth = true;
    composer.addPass(renderFg);

    // Bloom (high tier only) runs at half resolution. The composer resizes
    // every pass to full size, so re-apply the half size after each resize.
    const bloomPass = config.bloom
      ? new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 1.2, 0.5, 0.05)
      : null;
    const sizeBloom = () => {
      const dpr = renderer.getPixelRatio();
      bloomPass?.setSize((w * dpr) / 2, (h * dpr) / 2);
    };
    if (bloomPass) {
      composer.addPass(bloomPass);
      sizeBloom();
    }

    let time = 0;

    // On-load intro: the sphere appears filled and close, then dollies back to
    // its resting position while the centre hollows into the ring. Time-driven
    // (not scroll), starting on the first rendered frame.
    const INTRO_MS = 2600;
    let introStart = 0;

    const resizeObserver = new ResizeObserver(() => {
      w = Math.max(1, container.clientWidth);
      h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.fov = fovFor(w / h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      sizeBloom();
      bgMaterial.uniforms.uResolution.value.set(w, h);
    });
    resizeObserver.observe(container);

    const render = (now: number) => {
      if (!active.current || document.hidden) return;
      time += 0.005;

      if (introStart === 0) introStart = now;
      const introRaw = Math.min((now - introStart) / INTRO_MS, 1);
      const introEased = 1 - Math.pow(1 - introRaw, 3); // easeOutCubic
      material.uniforms.uIntro.value = introEased;

      const p = experienceProgress.current;

      material.uniforms.uTime.value = time;
      material.uniforms.uScroll.value = p;
      material.uniforms.uFade.value = particleFade(p);
      bgMaterial.uniforms.uTime.value = time;
      bgMaterial.uniforms.uScroll.value = p;

      // Intro dolly — start ~3 units closer and ease back to rest. Faded out
      // past the top so scrolling mid-intro doesn't fight the scroll camera.
      const introZoom = (1 - introEased) * -3.0 * (1 - Math.min(p / 0.05, 1));

      const cam = cameraAt(p);
      camera.position.set(0, cam.y, cam.z + introZoom);
      camera.lookAt(0, cam.lookY, cam.lookZ);
      particles.rotation.y = cam.rotY;
      particles.rotation.x = cam.rotX;

      composer.render();
    };

    const unsubscribe = subscribeToTicker(render, () => 0);

    return () => {
      unsubscribe();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      renderer.domElement.remove();
      geometry.dispose();
      material.dispose();
      bgGeometry.dispose();
      bgMaterial.dispose();
      bloomPass?.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [tier, active]);

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
};
