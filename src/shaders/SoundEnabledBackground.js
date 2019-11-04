import * as THREE from 'three'
import { FragmentShader as VoronoiFragmentShader } from './Voronoi3D'
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

const fragmentShader = VoronoiFragmentShader.replace('void main', '#include <waveform_chunk>\nvoid main')

const fragmentShader2 = `
precision mediump float;

uniform vec2 resolution;
uniform vec3 color;
uniform float time;
uniform float scale;

#include <waveform_chunk>

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio
float PI  = 3.14159265358979323846264 * 00000.1; // PI
float SQ2 = 1.41421356237309504880169 * 10000.0; // Square Root of Two

float gold_noise(in vec2 coordinate, in float seed){
    return fract(tan(distance(coordinate*(seed+PHI), vec2(PHI, PI)))*SQ2);
}

void main(void) {
  vec2 st = gl_FragCoord.xy/resolution.xy;
  float timeScaled = time * 0.1;
  vec2 stT = vec2(st.x + timeScaled, st.y + timeScaled);
  float sample = gold_noise(stT, 1.0) * gold_noise(st, waveform[WAVEFORM_RESOLUTION / 2]);
  gl_FragColor = mix(vec4(color, 1.0), vec4(st.x - sample * 0.5, st.y + sample * 0.5, 1.0, 1.0), 0.5);
}
`

export { VertexShader, fragmentShader2 as FragmentShader, Uniforms }
