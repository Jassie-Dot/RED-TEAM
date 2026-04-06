"use client";

import { memo, useEffect, useRef } from "react";

import { useAppStore } from "@/store/app-store";
import type { AppMode } from "@/types/app";

type Particle = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  tint: "neon" | "pulse";
};

type Palette = ReturnType<typeof paletteForMode>;

function paletteForMode(mode: AppMode) {
  return mode === "HR"
    ? {
        neon: "67, 240, 207",
        pulse: "255, 180, 83",
        aura: "86, 154, 255",
        densityBoost: 0,
      }
    : {
        neon: "98, 242, 210",
        pulse: "180, 255, 88",
        aura: "73, 211, 255",
        densityBoost: 14,
      };
}

export const ParticleBackground = memo(function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const paletteRef = useRef<Palette>(paletteForMode(useAppStore.getState().mode));
  const modeRef = useRef<AppMode>(useAppStore.getState().mode);
  const sizeRef = useRef({ width: 0, height: 0, ratio: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return;
    }

    contextRef.current = context;

    const drawGlow = (x: number, y: number, radius: number, color: string, alpha: number) => {
      const ctx = contextRef.current;
      if (!ctx) {
        return;
      }

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const createParticles = () => {
      const { width, height } = sizeRef.current;
      const palette = paletteRef.current;
      const density = (width > 1440 ? 92 : width > 1024 ? 76 : 48) + palette.densityBoost;

      particlesRef.current = Array.from({ length: density }, (_, index) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          radius: Math.random() * 1.8 + 0.7,
          phase: Math.random() * Math.PI * 2 + index * 0.05,
          tint: index % (modeRef.current === "HR" ? 3 : 2) === 0 ? "pulse" : "neon",
        };
      });
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.8);
      sizeRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio,
      };

      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      createParticles();
    };

    const render = () => {
      const ctx = contextRef.current;
      if (!ctx) {
        return;
      }

      const { width, height } = sizeRef.current;
      const palette = paletteRef.current;
      const pointer = pointerRef.current;
      const particles = particlesRef.current;
      const time = performance.now() * 0.001;

      ctx.clearRect(0, 0, width, height);

      drawGlow(width * 0.18, height * 0.12, 220 + Math.sin(time * 0.8) * 20, palette.neon, 0.07);
      drawGlow(width * 0.82, height * 0.16, 250 + Math.cos(time * 0.9) * 18, palette.pulse, 0.06);
      drawGlow(width * 0.56, height * 0.78, 280 + Math.sin(time * 0.65) * 24, palette.aura, 0.05);

      for (const particle of particles) {
        const driftX = Math.cos(time * 0.55 + particle.phase) * 8;
        const driftY = Math.sin(time * 0.7 + particle.phase) * 9;
        particle.x += particle.vx + (particle.originX + driftX - particle.x) * 0.01;
        particle.y += particle.vy + (particle.originY + driftY - particle.y) * 0.01;

        if (pointer.active) {
          const distance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
          if (distance > 0 && distance < 150) {
            const force = (150 - distance) / 150;
            particle.x -= ((pointer.x - particle.x) / distance) * force * 0.85;
            particle.y -= ((pointer.y - particle.y) / distance) * force * 0.85;
          }
        }

        if (particle.x < -30) particle.x = width + 30;
        if (particle.x > width + 30) particle.x = -30;
        if (particle.y < -30) particle.y = height + 30;
        if (particle.y > height + 30) particle.y = -30;

        const color = particle.tint === "neon" ? palette.neon : palette.pulse;
        const pulse = 0.45 + Math.sin(time * 2.1 + particle.phase) * 0.16;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, ${0.36 + pulse * 0.18})`;
        ctx.shadowBlur = 16;
        ctx.shadowColor = `rgba(${color}, 0.18)`;
        ctx.arc(particle.x, particle.y, particle.radius + pulse * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      for (let firstIndex = 0; firstIndex < particles.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < particles.length; secondIndex += 1) {
          const first = particles[firstIndex];
          const second = particles[secondIndex];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance > 96) {
            continue;
          }

          const alpha = 0.09 - distance / 1300;
          if (alpha <= 0.015) {
            continue;
          }

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${first.tint === "neon" ? palette.neon : palette.pulse}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(first.x, first.y);
          ctx.lineTo(second.x, second.y);
          ctx.stroke();
        }
      }

      rafRef.current = window.requestAnimationFrame(render);
    };

    const handleMove = (event: MouseEvent) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        active: true,
      };
    };

    const handleLeave = () => {
      pointerRef.current = {
        x: 0,
        y: 0,
        active: false,
      };
    };

    const unsubscribe = useAppStore.subscribe((state) => {
      if (state.mode === modeRef.current) {
        return;
      }

      modeRef.current = state.mode;
      paletteRef.current = paletteForMode(state.mode);
      createParticles();
    });

    resize();
    render();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave, { passive: true });

    return () => {
      unsubscribe();
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-70" />;
});
