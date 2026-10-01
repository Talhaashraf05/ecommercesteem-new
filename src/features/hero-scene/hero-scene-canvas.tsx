"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { createParticleRig } from "@/features/experience/particle-core";
import { cameraAt } from "@/features/experience/timeline";
import { subscribeToTicker } from "@/lib/animation/ticker";

import { SHAPE_PROGRESS, tiltTarget, type HeroShape } from "./shapes";

export interface HeroSceneCanvasProps {
  shape: HeroShape;
  /** Pointer tilt (desktop fine pointers only, never with reduced motion). */
  interactive: boolean;
  tier: "high" | "low";
  /** False while the hero is off-screen; the render loop idles. */
  active: React.RefObject<boolean>;
  /** Called when the GPU drops the context; the parent falls back to the gradient. */
  onContextLost: () => void;
}

const FRAME_MS = 1000 / 60;
/** Shader time per 60 fps frame, as on home. */
const TIME_PER_FRAME = 0.005;
/** Sphere-only on-load intro: the filled disc hollows into the ring. */
const INTRO_MS = 2600;
/** Ambient spin, radians per second. */
const SPIN_PER_S = 0.05;
/** Pointer tilt easing per 60 fps frame. */
const TILT_LERP = 0.06;
/**
 * Extra distance the camera backs away along its view line. At home's rest
 * distance the sphere fills the frame; a hero needs it whole with margin.
 * The funnel is ~49 units tall, so the camera backs far out to hold all of it.
 */
const DOLLY: Record<HeroShape, number> = { sphere: 7, funnel: 58, helix: 0, wave: 0 };
/**
 * Extra camera pitch in radians (negative looks down). Home's wave camera
 * looks up the scroll path, leaving the plane in the bottom third of a still
 * frame; pitching down lifts its horizon toward the middle. The funnel's
 * mouth sits above the camera, so a slight upward pitch centres it vertically.
 */
const PITCH: Record<HeroShape, number> = { sphere: 0, funnel: 0.07, helix: 0, wave: -0.35 };
/** Distance ahead of the camera the tilt pivots around (the sphere's centre at rest). */
const PIVOT_DISTANCE = 8;

/**
 * A still frame of the home particle morph for inner-page heroes: the shape's
 * legacy progress and camera are fixed; only the noise time, a slow spin and
 * an eased pointer tilt move. Transparent, so the page shows through.
 */
export const HeroSceneCanvas = ({ shape, interactive, tier, active, onContextLost }: HeroSceneCanvasProps) => {
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
      transparent: true,
      onContextLost: () => onContextLostRef.current(),
    });
    const { scene, camera, particles, material } = rig;

    const progress = SHAPE_PROGRESS[shape];
    const cam = cameraAt(progress);
    const viewDir = new THREE.Vector3(0, cam.lookY - cam.y, cam.lookZ - cam.z).normalize();
    camera.position.set(0, cam.y, cam.z).addScaledVector(viewDir, -DOLLY[shape]);
    camera.lookAt(0, cam.lookY, cam.lookZ);
    camera.rotateX(PITCH[shape]);

    // Tilt turns the cloud about a point in front of the camera rather than
    // the world origin, so shapes framed far from the origin don't swing away.
    const pivotPoint = new THREE.Vector3(0, cam.y, cam.z).addScaledVector(viewDir, PIVOT_DISTANCE);
    const pivot = new THREE.Group();
    pivot.position.copy(pivotPoint);
    scene.remove(particles);
    particles.position.copy(pivotPoint).negate();
    pivot.add(particles);
    scene.add(pivot);

    material.uniforms.uScroll.value = progress;
    material.uniforms.uFade.value = 1;
    material.uniforms.uIntro.value = shape === "sphere" ? 0 : 1;
    particles.rotation.x = cam.rotX;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canTilt = interactive && !reducedMotion && window.matchMedia("(pointer: fine)").matches;
    const tilt = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const t = tiltTarget(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
      target.x = t.x;
      target.y = t.y;
    };
    if (canTilt) window.addEventListener("pointermove", onPointerMove, { passive: true });

    let time = 0;
    let spin = 0;
    let lastNow: number | null = null;
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
      material.uniforms.uTime.value = time;

      if (shape === "sphere") {
        if (introStart === 0) introStart = now;
        const introRaw = Math.min((now - introStart) / INTRO_MS, 1);
        material.uniforms.uIntro.value = 1 - Math.pow(1 - introRaw, 3); // easeOutCubic
      }

      if (!reducedMotion) spin += SPIN_PER_S * (dt / 1000);
      particles.rotation.y = cam.rotY + spin;

      const k = Math.min(TILT_LERP * (dt / FRAME_MS), 1);
      tilt.x += (target.x - tilt.x) * k;
      tilt.y += (target.y - tilt.y) * k;
      pivot.rotation.set(tilt.x, tilt.y, 0);

      rig.render();
    };

    const unsubscribe = subscribeToTicker(render, () => 0);

    return () => {
      unsubscribe();
      if (canTilt) window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      rig.dispose();
    };
  }, [shape, interactive, tier, active]);

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
};
