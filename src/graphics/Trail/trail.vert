in float opacity;
in vec3 color;
in float size;

out float trailOpacity;
out vec3  trailColor;

void main() {
    trailOpacity = opacity;
    trailColor = color;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position  = projectionMatrix * mvPosition;
    gl_PointSize = size;
}
