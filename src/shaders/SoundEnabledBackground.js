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
// this is a raw shader material
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
varying vec3 vPosition;

void main() {
  vPosition = position;
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

varying vec3 vPosition;

#include <waveform_chunk>

void main(void) {
  vec2 st = gl_FragCoord.xy/resolution.xy;
  vec3 newColor = vec3(0.0);

  float waveformValue = waveform[int(WAVEFORM_RESOLUTION / 2)];

  float red = mix(0.49, 0.51, waveformValue);
  float blue = 0.5;

  gl_FragColor = vec4(newColor, 1.0);
  gl_FragColor.r = red;
  gl_FragColor.b = blue;
}
`

export { VertexShader, FragmentShader, Uniforms }
