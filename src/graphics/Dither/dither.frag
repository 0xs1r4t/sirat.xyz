uniform sampler2D uTexture;
uniform float     uIntensity;
uniform vec2      uResolution;
uniform int       uPattern;    // 0=2x2, 1=4x4, 2=8x8
uniform vec3      uTint;
uniform float     uContrast;
uniform float     uUseTint;

in vec2 vUv;

// Bayer matrices

float bayer2(vec2 p) {
  int x = int(mod(p.x, 2.0));
  int y = int(mod(p.y, 2.0));
  int i = x + y * 2;
  float m[4];
  m[0] = 0.25;  m[1] = 0.75;
  m[2] = 1.00;  m[3] = 0.50;
  return m[i];
}

float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int i = x + y * 4;
  float m[16];
  m[0]  = 0.0625;  m[1]  = 0.5625;  m[2]  = 0.1875;  m[3]  = 0.6875;
  m[4]  = 0.8125;  m[5]  = 0.3125;  m[6]  = 0.9375;  m[7]  = 0.4375;
  m[8]  = 0.2500;  m[9]  = 0.7500;  m[10] = 0.1250;  m[11] = 0.6250;
  m[12] = 1.0000;  m[13] = 0.5000;  m[14] = 0.8750;  m[15] = 0.3750;
  return m[i];
}

float bayer8(vec2 p) {
  int x = int(mod(p.x, 8.0));
  int y = int(mod(p.y, 8.0));
  int i = x + y * 8;
  float m[64];
  m[0]=0.015625; m[1]=0.515625; m[2]=0.140625; m[3]=0.640625;
  m[4]=0.046875; m[5]=0.546875; m[6]=0.171875; m[7]=0.671875;
  m[8]=0.765625; m[9]=0.265625; m[10]=0.890625; m[11]=0.390625;
  m[12]=0.796875; m[13]=0.296875; m[14]=0.921875; m[15]=0.421875;
  m[16]=0.203125; m[17]=0.703125; m[18]=0.078125; m[19]=0.578125;
  m[20]=0.234375; m[21]=0.734375; m[22]=0.109375; m[23]=0.609375;
  m[24]=0.953125; m[25]=0.453125; m[26]=0.828125; m[27]=0.328125;
  m[28]=0.984375; m[29]=0.484375; m[30]=0.859375; m[31]=0.359375;
  m[32]=0.062500; m[33]=0.562500; m[34]=0.187500; m[35]=0.687500;
  m[36]=0.031250; m[37]=0.531250; m[38]=0.156250; m[39]=0.656250;
  m[40]=0.812500; m[41]=0.312500; m[42]=0.937500; m[43]=0.437500;
  m[44]=0.781250; m[45]=0.281250; m[46]=0.906250; m[47]=0.406250;
  m[48]=0.250000; m[49]=0.750000; m[50]=0.125000; m[51]=0.625000;
  m[52]=0.218750; m[53]=0.718750; m[54]=0.093750; m[55]=0.593750;
  m[56]=1.000000; m[57]=0.500000; m[58]=0.875000; m[59]=0.375000;
  m[60]=0.968750; m[61]=0.468750; m[62]=0.843750; m[63]=0.343750;
  return m[i];
}

// Cel quantisation (4 tones)

vec3 celQuantise(vec3 color) {
  return floor(color * 4.0) / 4.0;
}

// Luma

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

// Main

void main() {
  vec4 tex = texture2D(uTexture, vUv);

  // Optional tint + contrast
  vec3 color = tex.rgb;
  if (uUseTint > 0.5) {
    color = (color - 0.5) * uContrast + 0.5;
    color *= uTint;
  }

  // Bayer threshold at screen pixel coords
  vec2 screen = gl_FragCoord.xy;
  float threshold = uPattern == 0 ? bayer2(screen)
                  : uPattern == 1 ? bayer4(screen)
                                  : bayer8(screen);

  // Dither: shift each channel by threshold, then quantise to 4 cel tones
  vec3 shifted   = color + (threshold - 0.5) * uIntensity * 0.5;
  vec3 dithered  = celQuantise(clamp(shifted, 0.0, 1.0));

  gl_FragColor = vec4(dithered, tex.a);
}
