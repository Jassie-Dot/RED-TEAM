declare module "three";

declare module "three/examples/jsm/postprocessing/EffectComposer.js" {
  export class EffectComposer {
    constructor(renderer: unknown);
    addPass(pass: unknown): void;
    setSize(width: number, height: number): void;
    setPixelRatio(pixelRatio: number): void;
    render(): void;
    renderTarget1: { dispose(): void };
    renderTarget2: { dispose(): void };
  }
}

declare module "three/examples/jsm/postprocessing/RenderPass.js" {
  export class RenderPass {
    constructor(scene: unknown, camera: unknown);
  }
}

declare module "three/examples/jsm/postprocessing/UnrealBloomPass.js" {
  export class UnrealBloomPass {
    constructor(resolution: unknown, strength?: number, radius?: number, threshold?: number);
    threshold: number;
    strength: number;
    radius: number;
    dispose(): void;
  }
}
