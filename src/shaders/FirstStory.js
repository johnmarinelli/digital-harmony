import * as THREE from 'three'
const Uniforms = (resolution, color) => ({
  resolution: {
    type: 'v2',
    value: resolution,
  },
  time: { type: 'f', value: 0 },
  color: { value: new THREE.Color(color) },
})
const VertexShader = `
  void main() {
    vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = pos;
  }
`

const FragmentShader = `
#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 resolution;
uniform vec3 color;
uniform float time;

highp float rand(vec2 co) {
    return fract(sin(mod(dot(co.xy ,vec2(12.9898,78.233)),3.14))*43758.5453);
}

float tnoise(vec2 co){
    vec2 w=co;
    co.y+=co.x/2.;
    const vec2 s=vec2(1.,0.);
    vec2 p=floor(co);
    if(fract(co.x)<fract(co.y))p+=0.5;
    return rand(p);
}

void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / 40.;
    float n = tnoise(uv);
    gl_FragColor = vec4(sin(time * n * 7. + n * 3.141592653589793 * 2.) * 0.5);
    gl_FragColor += sin((uv.x - uv.y) *30.) / 2.;
    gl_FragColor += rand(uv)/2.;
    gl_FragColor /= 16.;
}
`

export { VertexShader, FragmentShader, Uniforms }
