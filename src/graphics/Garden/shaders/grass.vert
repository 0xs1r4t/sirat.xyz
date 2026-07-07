// Ported from web-terrain-generator shaders/grass/grass.vert.
// position and uv are auto-injected by Three.js ShaderMaterial.
attribute vec3  instanceOffset;
attribute float windPhase;

uniform float nearDist;
uniform float farDist;

uniform float time;
uniform float windSpeed;
uniform float windStrength;

varying vec2  TexCoords;
varying vec3  FragPos;
varying float HeightFactor;
varying float WindInfluence;

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
    return dot(n, vec3(70.0));
}

// Matches C++ LODConfig density carpet: 100% under 8 units, smooth falloff to farDist
float computeDensityThreshold(float dist, float nearDist, float farDist) {
    const float ultraNear = 8.0;
    if (dist < ultraNear) {
        return 1.0;
    } else if (dist < nearDist) {
        float t = (dist - ultraNear) / max(nearDist - ultraNear, 0.001);
        return mix(1.0, 0.6, t);
    } else {
        float t = clamp((dist - nearDist) / max(farDist - nearDist, 0.001), 0.0, 1.0);
        return mix(0.6, 0.0, t);
    }
}

// Deterministic hash matching C++'s bitwise position hash
// (abs() guards the float→uint cast for negative world coords in GLSL ES 3.00)
float densityHash(vec3 pos) {
    uint hx = uint(abs(pos.x) * 73856093.0);
    uint hz = uint(abs(pos.z) * 19349663.0);
    uint h = hx ^ hz;
    return float(h % 1000u) / 1000.0;
}

void main() {
    TexCoords = uv;

    float dist = length(cameraPosition - instanceOffset);
    float densityThreshold = computeDensityThreshold(dist, nearDist, farDist);
    float rnd = densityHash(instanceOffset);

    if (rnd >= densityThreshold) {
        gl_Position = vec4(0.0, 0.0, -9999.0, 1.0);
        return;
    }

    // Y-locked cylindrical billboard
    vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 cameraUp    = vec3(0.0, 1.0, 0.0);

    // 3-octave simplex wind
    vec2 windUV = instanceOffset.xz * 0.5 + time * windSpeed * vec2(0.6, 0.4);
    float wind1    = noise(windUV) * 0.5 + 0.5;
    float wind2    = noise(windUV * 2.5 + time * 0.8) * 0.5 + 0.5;
    float wind3    = noise(windUV * 0.8 - time * 0.3) * 0.5 + 0.5;
    float windNoise = (wind1 * 0.5 + wind2 * 0.3 + wind3 * 0.2) - 0.5;

    // Quadratic height bend — tips sway, roots stay planted
    float heightInfluence = position.y * position.y;
    vec2 windDirection    = vec2(windNoise * windStrength * heightInfluence,
        windNoise * windStrength * 0.6 * heightInfluence);

    float bladeVariation = fract(sin(windPhase) * 43758.5453);
    windDirection *= (0.8 + bladeVariation * 0.4);

    vec3 windOffset3         = vec3(windDirection.x, 0.0, windDirection.y);
    vec3 instancePosWithWind = instanceOffset + windOffset3;

    vec3 billboardPos = instancePosWithWind + cameraRight * position.x + cameraUp * position.y;

    FragPos       = billboardPos;
    HeightFactor  = uv.y;
    WindInfluence = (wind1 + wind2) * 0.5;

    gl_Position = projectionMatrix * viewMatrix * vec4(FragPos, 1.0);
}
