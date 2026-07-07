// Theme-driven exp² fog. uFogColor tracks --color-background live (see
// useGardenTheme), and the canvas is transparent, so distant geometry
// melts into the page in every theme with no rebuild on switch.
uniform vec3  uFogColor;
uniform float uFogDensity;

vec3 applyGardenFog(vec3 color, vec3 fragPos) {
    float dist = length(fragPos - cameraPosition);
    float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
    return mix(color, uFogColor, clamp(fogFactor, 0.0, 1.0));
}
