// Ported from web-terrain-generator shaders/flower/flower.frag —
// flower_1.png / flower_2.png sampled by per-post textureIndex, alpha
// tested, wind shimmer. Additions: hover brighten + themed fog.
varying vec2  TexCoords;
varying vec3  FragPos;
varying float TexIndex;
varying float Hover;
varying float HeightFactor;
varying float WindInfluence;

uniform sampler2D flowerTexture0;
uniform sampler2D flowerTexture1;

void main() {
    vec4 texColor;
    if (TexIndex < 0.5) {
        texColor = texture2D(flowerTexture0, TexCoords);
    } else {
        texColor = texture2D(flowerTexture1, TexCoords);
    }

    if (texColor.a < 0.01) discard;

    float windShimmer = WindInfluence * HeightFactor * 0.1;
    vec3 finalColor = texColor.rgb * (1.0 + windShimmer + Hover * 0.15);

    finalColor = applyGardenFog(finalColor, FragPos);

    gl_FragColor = vec4(finalColor, texColor.a);
}
