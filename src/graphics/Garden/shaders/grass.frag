// Ported from web-terrain-generator shaders/grass/grass.frag — Grass.png
// red channel is the alpha mask, colors come from the colors.glsl grass
// palette (kept constant across site themes per design). Themed fog on top.
varying vec2  TexCoords;
varying vec3  FragPos;
varying float HeightFactor;
varying float WindInfluence;

uniform sampler2D grassTexture;
uniform vec3 lightDir;

void main() {
    vec4 texColor = texture2D(grassTexture, TexCoords);
    float alpha = texColor.r;
    if (alpha < 0.2) discard;

    // lightDir may be zero if not passed — use a safe fallback
    vec3 safeLight = length(lightDir) > 0.001 ? normalize(-lightDir) : vec3(0.0, 1.0, 0.0);
    vec3 normal = vec3(0.0, 1.0, 0.0);
    float lightIntensity = dot(safeLight, normal) * 0.5 + 0.5;

    float windShimmer = WindInfluence * HeightFactor * 0.15;
    lightIntensity += windShimmer;

    vec3 windTint = vec3(0.1, 0.15, 0.05) * WindInfluence * HeightFactor * 0.2;

    vec3 baseColor = mix(GRASS_DARK, GRASS_MID, HeightFactor * 0.5);
    if (HeightFactor > 0.7) {
        baseColor = mix(GRASS_MID, GRASS_TIP, (HeightFactor - 0.7) / 0.3);
    }
    baseColor += windTint;

    vec3 color = celShadeSmoothBands(lightIntensity, baseColor * 0.7, baseColor * 1.2, 4.0);

    if (HeightFactor > 0.8 && WindInfluence > 0.6) {
        color += vec3(0.1, 0.12, 0.08) * (HeightFactor - 0.8) * 2.0;
    }

    color = applyGardenFog(color, FragPos);

    gl_FragColor = vec4(color, alpha);
}
