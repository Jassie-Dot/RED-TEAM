import * as THREE from "three";

export interface SentinelGeometryOptions {
  count: number;
  minRadius: number;
  maxRadius: number;
  randomness?: number;
}

function createRandomAttributes(count: number) {
  const randoms = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    randoms[index * 3] = Math.random();
    randoms[index * 3 + 1] = Math.random();
    randoms[index * 3 + 2] = Math.random();
    scales[index] = 0.55 + Math.random() * 1.35;
  }

  return { randoms, scales };
}

export function createSphereParticleGeometry({
  count,
  minRadius,
  maxRadius,
  randomness = 0.08,
}: SentinelGeometryOptions) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const { randoms, scales } = createRandomAttributes(count);

  for (let index = 0; index < count; index += 1) {
    const u = Math.random();
    const v = Math.random();
    const theta = Math.acos(2 * v - 1);
    const phi = Math.PI * 2 * u;
    const radius = THREE.MathUtils.lerp(minRadius, maxRadius, Math.pow(Math.random(), 0.72));
    const organicRadius = radius + (Math.random() - 0.5) * randomness;

    positions[index * 3] = organicRadius * Math.sin(theta) * Math.cos(phi);
    positions[index * 3 + 1] = organicRadius * Math.cos(theta);
    positions[index * 3 + 2] = organicRadius * Math.sin(theta) * Math.sin(phi);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.computeBoundingSphere();

  return geometry;
}

export function createRingParticleGeometry(count: number, radius: number, thickness: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const { randoms, scales } = createRandomAttributes(count);

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.06;
    const radialOffset = (Math.random() - 0.5) * thickness;
    const verticalOffset = (Math.random() - 0.5) * thickness * 0.16;
    const finalRadius = radius + radialOffset;

    positions[index * 3] = Math.cos(angle) * finalRadius;
    positions[index * 3 + 1] = verticalOffset;
    positions[index * 3 + 2] = Math.sin(angle) * finalRadius;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.computeBoundingSphere();

  return geometry;
}

export function createDustGeometry(count: number, spread: number, avoidRadius: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const { randoms, scales } = createRandomAttributes(count);

  for (let index = 0; index < count; index += 1) {
    let x = 0;
    let y = 0;
    let z = 0;

    do {
      x = (Math.random() - 0.5) * spread * 2.1;
      y = (Math.random() - 0.5) * spread * 1.55;
      z = (Math.random() - 0.5) * spread * 2.4;
    } while (Math.sqrt(x * x + y * y + z * z) < avoidRadius);

    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.computeBoundingSphere();

  return geometry;
}
