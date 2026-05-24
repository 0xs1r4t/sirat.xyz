uniform vec2 uUVScale;
uniform vec2 uUVOffset;
out vec2 vUv;

void main() {
    vUv = uv * uUVScale + uUVOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}