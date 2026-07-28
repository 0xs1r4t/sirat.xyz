// Ported from web-terrain-generator shaders/terrain/terrain.frag.
// Two adaptations for the garden:
//  1. Height bands are relative to uHeightScale instead of absolute world
//     units, so they hold at any heightScale. Thresholds 0.3/0.8/1.4/2.0 are
//     the original C++ absolutes (1.5/4/7/10) divided by its heightScale of
//     5 — the top two bands (brown highlands, grey peaks) are unreachable by
//     the normalized [0,1] noise output, exactly like the original.
//  2. Themed fog toward --color-background at the end.
varying vec3 FragPos;
varying vec3 Normal;
varying vec2 TexCoords;
varying vec3 VertexColor;

uniform vec3  lightPos;
uniform float uHeightScale;

// Get terrain color based on height ratio (same ramp, normalized)
vec3 getTerrainColor(float heightRatio) {
    // Low (valleys) - dark mossy green
    if (heightRatio < 0.3) {
        return vec3(0.2, 0.3, 0.15);
    }
    // Mid-low (plains) - grass
    else if (heightRatio < 0.8) {
        return GRASS_DARK;
    }
    // Mid (gentle hills) - lighter grass
    else if (heightRatio < 1.4) {
        return GRASS_MID;
    }
    // High (hills) - brownish grass
    else if (heightRatio < 2.0) {
        return vec3(0.45, 0.5, 0.35);
    }
    // Peaks - rocky/grey
    else {
        return vec3(0.5, 0.5, 0.45);
    }
}

void main() {
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);

    // Lighting (half-lambert)
    float NdotL = dot(norm, lightDir) * 0.5 + 0.5;

    // Get base color from height
    float heightRatio = FragPos.y / max(uHeightScale, 0.001);
    vec3 baseColor = getTerrainColor(heightRatio);

    // Apply cel-shading
    vec3 shadedColor = celShade4Band(
        NdotL,
        baseColor * 0.4,
        baseColor * 0.65,
        baseColor * 0.85,
        baseColor * 1.0);

    // Darken steep slopes (ambient occlusion)
    float slope = norm.y; // 1.0 = flat, 0.0 = cliff
    shadedColor *= mix(0.5, 1.0, slope);

    shadedColor = applyGardenFog(shadedColor, FragPos);

    gl_FragColor = vec4(shadedColor, 1.0);
}
