// Theme-driven linear near/far fog. uFogColor tracks --color-background live
// (see useGardenTheme), and the canvas is transparent, so distant geometry
// melts into the page in every theme with no rebuild on switch. No fog
// before uFogNear; ramps smoothly to fully uFogColor by uFogFar.
uniform vec3  uFogColor;
uniform float uFogNear;
uniform float uFogFar;

vec3 applyGardenFog(vec3 color, vec3 fragPos) {
    float dist = length(fragPos - cameraPosition);
    float fogFactor = smoothstep(uFogNear, uFogFar, dist);
    return mix(color, uFogColor, fogFactor);
}
