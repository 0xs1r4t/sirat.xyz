precision mediump float;

in float trailOpacity;
in vec3  trailColor;

void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) discard;

    gl_FragColor = vec4(trailColor, trailOpacity);
}
