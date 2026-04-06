export const sentinelCoreVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uPulseStrength;
uniform float uOpacity;
uniform vec2 uPointer;
uniform float uPointerStrength;

attribute vec3 aRandom;
attribute float aScale;

varying float vAlpha;
varying float vEnergy;
varying float vCore;

vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec3 base = position;
  vec3 normalDir = normalize(base);

  float globalPulse = sin(uTime * 1.25) * 0.5 + 0.5;
  float perParticlePulse = sin(uTime * 1.85 + aRandom.x * 6.2831853) * 0.5 + 0.5;
  float breathe = 1.0 + (globalPulse * 0.034 + perParticlePulse * 0.018) * uPulseStrength;

  float noisePrimary = snoise(normalDir * 2.65 + vec3(uTime * 0.45 + aRandom.x * 4.0, uTime * 0.28 + aRandom.y * 4.0, uTime * 0.34 + aRandom.z * 4.0));
  float noiseSecondary = snoise(base * 1.9 + vec3(-uTime * 0.21, uTime * 0.17, uTime * 0.24));
  float energyNoise = mix(noisePrimary, noiseSecondary, 0.45);

  vec3 displaced = base * breathe;
  displaced += normalDir * energyNoise * 0.06;

  vec3 tangent = normalize(cross(normalDir, normalize(vec3(0.35, 1.0, 0.25))));
  displaced += tangent * energyNoise * 0.012;

  float pointerDistance = length(normalDir.xy - uPointer * 1.15);
  float pointerInfluence = exp(-pointerDistance * 5.8) * uPointerStrength;
  displaced += normalDir * pointerInfluence * 0.065;
  displaced += vec3(uPointer * 0.05, 0.0) * pointerInfluence;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float perspective = 1.0 / max(2.3, -mvPosition.z);
  gl_PointSize = min(uSize * aScale * uPixelRatio * perspective, uSize * 2.15);

  vAlpha = (0.22 + perParticlePulse * 0.16 + energyNoise * 0.05 + pointerInfluence * 0.08) * uOpacity;
  vEnergy = 0.5 + globalPulse * 0.38 + energyNoise * 0.1;
  vCore = 0.45 + aRandom.z * 0.28;
}
`;

export const sentinelCoreFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;

varying float vAlpha;
varying float vEnergy;
varying float vCore;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  float softEdge = smoothstep(0.5, 0.08, dist);
  float glow = exp(-dist * 4.6);
  float core = smoothstep(0.18, 0.0, dist);

  float alpha = (softEdge * 0.5 + glow * 0.2 + core * 0.22) * vAlpha;
  if (alpha < 0.012) {
    discard;
  }

  vec3 color = mix(uColor, uAccent, core * 0.42 + vCore * 0.14);
  color += uAccent * glow * 0.08 * vEnergy;

  gl_FragColor = vec4(color, alpha);
}
`;

export const sentinelRingVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uOpacity;
uniform vec2 uPointer;
uniform float uPointerStrength;

attribute vec3 aRandom;
attribute float aScale;

varying float vAlpha;
varying float vEnergy;

void main() {
  vec3 displaced = position;

  float wave = sin(aRandom.x * 6.2831853 + uTime * 0.95) * 0.055;
  float ripple = cos(aRandom.y * 6.2831853 - uTime * 0.78) * 0.03;
  displaced.y += wave * 0.65 + ripple * 0.65;
  displaced.xz *= 1.0 + sin(uTime * 0.42 + aRandom.z * 4.0) * 0.008;

  float pointerDistance = length(normalize(vec2(displaced.x, displaced.z)) * 0.72 - uPointer);
  float pointerInfluence = exp(-pointerDistance * 4.2) * uPointerStrength;
  displaced += normalize(vec3(displaced.x, 0.0, displaced.z)) * pointerInfluence * 0.045;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float perspective = 1.0 / max(2.6, -mvPosition.z);
  gl_PointSize = min(uSize * aScale * uPixelRatio * perspective, uSize * 1.65);

  vAlpha = (0.08 + (sin(uTime * 1.2 + aRandom.z * 8.0) * 0.5 + 0.5) * 0.12 + pointerInfluence * 0.06) * uOpacity;
  vEnergy = 0.42 + aRandom.x * 0.22;
}
`;

export const sentinelRingFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;

varying float vAlpha;
varying float vEnergy;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  float softEdge = smoothstep(0.48, 0.06, dist);
  float alpha = softEdge * vAlpha;

  if (alpha < 0.015) {
    discard;
  }

  vec3 color = mix(uColor, uAccent, 0.22 + vEnergy * 0.12);
  gl_FragColor = vec4(color, alpha);
}
`;

export const sentinelDustVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uOpacity;
uniform vec2 uPointer;

attribute vec3 aRandom;
attribute float aScale;

varying float vAlpha;

void main() {
  vec3 displaced = position;
  displaced.x += sin(uTime * 0.08 + aRandom.x * 10.0) * 0.05;
  displaced.y += cos(uTime * 0.12 + aRandom.y * 10.0) * 0.05;
  displaced.xy += uPointer * (0.02 + aRandom.z * 0.02);

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float perspective = 1.0 / max(3.0, -mvPosition.z);
  gl_PointSize = min(uSize * aScale * uPixelRatio * perspective, uSize * 1.6);
  vAlpha = (0.05 + aRandom.x * 0.08) * uOpacity;
}
`;

export const sentinelDustFragmentShader = /* glsl */ `
uniform vec3 uColor;

varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  float softEdge = smoothstep(0.5, 0.0, dist);
  float alpha = softEdge * vAlpha;

  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(uColor, alpha);
}
`;
