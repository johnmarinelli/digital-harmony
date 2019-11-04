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

void main(void) {
  vec2 st = gl_FragCoord.xy/resolution.xy;
  gl_FragColor = mix(vec4(color, 1.0), vec4(st.x, st.y, 1.0), 0.5);
}
`

export { VertexShader, fragmentShader2 as FragmentShader, Uniforms }
