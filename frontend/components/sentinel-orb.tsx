"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { createDustGeometry, createSphereParticleGeometry } from "@/components/sentinel-core-geometry";
import {
  sentinelCoreFragmentShader,
  sentinelCoreVertexShader,
  sentinelDustFragmentShader,
  sentinelDustVertexShader,
} from "@/components/sentinel-core-shaders";
import type { AssistantState } from "@/types/resume";

const STATE_COLORS: Record<AssistantState, string> = {
  idle: "#00F0FF",
  analyzing: "#5BFFF5",
  alert: "#FF7A9A",
  listening: "#8BFFAC",
  speaking: "#7CF7FF",
};

interface SentinelPreset {
  outerCount: number;
  innerCount: number;
  dustCount: number;
  outerSize: number;
  innerSize: number;
  dustSize: number;
  outerOpacity: number;
  innerOpacity: number;
  dustOpacity: number;
}

function getSentinelPreset(size: number): SentinelPreset {
  if (size < 80) {
    return {
      outerCount: 420,
      innerCount: 140,
      dustCount: 28,
      outerSize: 3.9,
      innerSize: 5.4,
      dustSize: 0.8,
      outerOpacity: 0.94,
      innerOpacity: 0.78,
      dustOpacity: 0.22,
    };
  }

  if (size < 140) {
    return {
      outerCount: 760,
      innerCount: 240,
      dustCount: 42,
      outerSize: 4.3,
      innerSize: 5.8,
      dustSize: 0.9,
      outerOpacity: 0.96,
      innerOpacity: 0.8,
      dustOpacity: 0.24,
    };
  }

  return {
    outerCount: 1280,
    innerCount: 360,
    dustCount: 58,
    outerSize: 4.7,
    innerSize: 6.2,
    dustSize: 1,
    outerOpacity: 0.98,
    innerOpacity: 0.82,
    dustOpacity: 0.26,
  };
}

function createCoreMaterial({
  color,
  accent,
  size,
  pulseStrength,
  opacity,
}: {
  color: unknown;
  accent: unknown;
  size: number;
  pulseStrength: number;
  opacity: number;
}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: 1 },
      uPulseStrength: { value: pulseStrength },
      uOpacity: { value: opacity },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uColor: { value: color },
      uAccent: { value: accent },
    },
    vertexShader: sentinelCoreVertexShader,
    fragmentShader: sentinelCoreFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function createDustMaterial({ color, size, opacity }: { color: unknown; size: number; opacity: number }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: 1 },
      uOpacity: { value: opacity },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: color },
    },
    vertexShader: sentinelDustVertexShader,
    fragmentShader: sentinelDustFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function SentinelOrb({ state, size = 220 }: { state: AssistantState; size?: number }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const preset = getSentinelPreset(size);
    const primaryColor = new THREE.Color(STATE_COLORS[state]);
    const accentColor = primaryColor.clone().lerp(new THREE.Color("#F5FEFF"), 0.42);
    const dustColor = new THREE.Color("#5BDFFF");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);
    camera.position.set(0, 0, size < 90 ? 5.6 : 5.15);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.setClearColor(0x000000, 0);
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const systemGroup = new THREE.Group();
    scene.add(systemGroup);

    const outerGeometry = createSphereParticleGeometry({
      count: preset.outerCount,
      minRadius: 0.86,
      maxRadius: 1.02,
      randomness: 0.04,
    });
    const innerGeometry = createSphereParticleGeometry({
      count: preset.innerCount,
      minRadius: 0.02,
      maxRadius: 0.58,
      randomness: 0.015,
    });
    const dustGeometry = createDustGeometry(preset.dustCount, 6.8, 2.4);

    const outerMaterial = createCoreMaterial({
      color: primaryColor,
      accent: accentColor,
      size: preset.outerSize,
      pulseStrength: state === "alert" ? 1.25 : state === "analyzing" ? 1.1 : 1,
      opacity: preset.outerOpacity,
    });
    const innerMaterial = createCoreMaterial({
      color: primaryColor.clone().lerp(new THREE.Color("#B7FDFF"), 0.35),
      accent: new THREE.Color("#E8FFFF"),
      size: preset.innerSize,
      pulseStrength: state === "alert" ? 1.3 : 1.08,
      opacity: preset.innerOpacity,
    });
    const dustMaterial = createDustMaterial({
      color: dustColor,
      size: preset.dustSize,
      opacity: preset.dustOpacity,
    });

    const outerCore = new THREE.Points(outerGeometry, outerMaterial);
    const innerCore = new THREE.Points(innerGeometry, innerMaterial);
    const dust = new THREE.Points(dustGeometry, dustMaterial);

    outerCore.renderOrder = 3;
    innerCore.renderOrder = 4;
    dust.renderOrder = 1;

    systemGroup.add(dust);
    systemGroup.add(outerCore);
    systemGroup.add(innerCore);

    const clock = new THREE.Clock();
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);
    let pointerStrength = 0;
    let pointerStrengthTarget = 0;
    let animationFrame = 0;

    const updatePixelRatioUniforms = (pixelRatio: number) => {
      outerMaterial.uniforms.uPixelRatio.value = pixelRatio;
      innerMaterial.uniforms.uPixelRatio.value = pixelRatio;
      dustMaterial.uniforms.uPixelRatio.value = pixelRatio;
    };

    const resize = () => {
      const width = mount.clientWidth || size;
      const height = mount.clientHeight || size;
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5);

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      updatePixelRatioUniforms(pixelRatio);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
      pointerStrengthTarget = 1;
    };

    const handlePointerLeave = () => {
      pointerTarget.set(0, 0);
      pointerStrengthTarget = 0;
    };

    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerleave", handlePointerLeave);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const render = () => {
      const elapsed = clock.getElapsedTime();
      pointerCurrent.lerp(pointerTarget, 0.085);
      pointerStrength += (pointerStrengthTarget - pointerStrength) * 0.075;

      outerMaterial.uniforms.uTime.value = elapsed;
      outerMaterial.uniforms.uPointer.value.copy(pointerCurrent);
      outerMaterial.uniforms.uPointerStrength.value = pointerStrength;

      innerMaterial.uniforms.uTime.value = elapsed + 0.22;
      innerMaterial.uniforms.uPointer.value.copy(pointerCurrent);
      innerMaterial.uniforms.uPointerStrength.value = pointerStrength * 1.05;

      dustMaterial.uniforms.uTime.value = elapsed;
      dustMaterial.uniforms.uPointer.value.copy(pointerCurrent);

      const breathing = 1 + Math.sin(elapsed * 1.02) * 0.024;
      const innerBreathing = 1 + Math.sin(elapsed * 1.26 + 0.45) * 0.052;

      outerCore.scale.setScalar(breathing);
      innerCore.scale.setScalar(innerBreathing);

      systemGroup.rotation.y = elapsed * 0.18 + pointerCurrent.x * 0.11;
      systemGroup.rotation.x = Math.sin(elapsed * 0.22) * 0.05 + pointerCurrent.y * 0.05;
      systemGroup.rotation.z = Math.cos(elapsed * 0.14) * 0.018 + pointerCurrent.x * 0.018;

      dust.rotation.y = elapsed * 0.015;
      dust.rotation.x = Math.sin(elapsed * 0.09) * 0.05;

      camera.position.x += (pointerCurrent.x * 0.26 - camera.position.x) * 0.045;
      camera.position.y += (pointerCurrent.y * 0.18 - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerleave", handlePointerLeave);

      outerGeometry.dispose();
      innerGeometry.dispose();
      dustGeometry.dispose();

      outerMaterial.dispose();
      innerMaterial.dispose();
      dustMaterial.dispose();
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, [size, state]);

  return (
    <div
      ref={mountRef}
      className="mx-auto overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_50%_34%,rgba(0,240,255,0.12),transparent_34%),radial-gradient(circle_at_50%_68%,rgba(0,120,145,0.18),transparent_62%),linear-gradient(180deg,rgba(3,10,18,0.96),rgba(4,10,18,0.82))]"
      style={{ height: size, width: size }}
    />
  );
}
