"use client";

import { useEffect, useRef } from "react";

import { subscribeToTicker } from "@/lib/animation/ticker";

import { createParticleRig } from "./particle-core";
import { experienceProgress } from "./progress";
import { cameraAt, particleFade } from "./timeline";

export interface ParticleCanvasProps {
  tier: "high" | "low";
  /** False while the section is off-screen; the render loop idles. */
  active: React.RefObject<boolean>;
  /** Called when the GPU drops the context — the parent falls back to the gradient. */
  onContextLost: () => void;
}

/**
 * WebGL backdrop for the home experience, ported from New Era's particle canvas:
 * the scroll-driven particle morph + (high tier) UnrealBloom.
 *
 * Progress is read from `experienceProgress` (section-relative, legacy units),
 * written each frame by ExperienceSection — never from document scroll. Sized to
 * its container (the sticky stage), not the window. Setup, sizing and teardown
 * live in the shared particle rig; this component owns the per-frame home logic.
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

    const rig = createParticleRig({
      container,
      tier,
      transparent: false,
      onContextLost: () => onContextLostRef.current(),
    });
    const { camera, particles, material } = rig;

    let time = 0;
    let lastNow: number | null = null;
    // Shader time advances 0.005 per 60 fps frame, scaled by the real frame delta
    // so 120 Hz screens don't run twice as fast. Clamped so a stall can't lurch.
    const FRAME_MS = 1000 / 60;
    const TIME_PER_FRAME = 0.005;

    // On-load intro: the sphere appears filled and close, then dollies back to
    // its resting position while the centre hollows into the ring. Time-driven
    // (not scroll), starting on the first rendered frame.
    const INTRO_MS = 2600;
    let introStart = 0;

    const resizeObserver = new ResizeObserver(() => {
      rig.resize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    const render = (now: number) => {
      if (!active.current || document.hidden) {
        lastNow = null;
        return;
      }
      const dt = lastNow === null ? FRAME_MS : Math.min(Math.max(now - lastNow, 0), 100);
      lastNow = now;
      time += TIME_PER_FRAME * (dt / FRAME_MS);

      if (introStart === 0) introStart = now;
      const introRaw = Math.min((now - introStart) / INTRO_MS, 1);
      const introEased = 1 - Math.pow(1 - introRaw, 3); // easeOutCubic
      material.uniforms.uIntro.value = introEased;

      const p = experienceProgress.current;

      material.uniforms.uTime.value = time;
      material.uniforms.uScroll.value = p;
      material.uniforms.uFade.value = particleFade(p);

      // Intro dolly — start ~3 units closer and ease back to rest. Faded out
      // past the top so scrolling mid-intro doesn't fight the scroll camera.
      const introZoom = (1 - introEased) * -3.0 * (1 - Math.min(p / 0.05, 1));

      const cam = cameraAt(p);
      camera.position.set(0, cam.y, cam.z + introZoom);
      camera.lookAt(0, cam.lookY, cam.lookZ);
      particles.rotation.y = cam.rotY;
      particles.rotation.x = cam.rotX;

      rig.render();
    };

    const unsubscribe = subscribeToTicker(render, () => 0);

    return () => {
      unsubscribe();
      resizeObserver.disconnect();
      rig.dispose();
    };
  }, [tier, active]);

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
};
