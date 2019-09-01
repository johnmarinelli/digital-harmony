import React, { useMemo, useRef } from 'react'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import Background from './Background'
import { VertexShader, FragmentShader } from '../shaders/LiveSceneShader'

class RingPointMaterial extends THREE.RawShaderMaterial {
  constructor() {
    const resolution = 128
    const color = new THREE.Color(1, 1, 1)
    const opacity = 1.0
    const size = 1.0
    const blending = THREE.NormalBlending
    const shape = 'circle'
    const radius = 1.0

    const waveform = new Float32Array(resolution)
    for (let i = 0; i < resolution; i++) {
      waveform[i] = 0
    }
    super({
      fog: true,
      blending: blending,
      defines: {
        WAVEFORM_RESOLUTION: resolution,
      },
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      transparent: true,
      uniforms: {
        shape: {
          type: 't',
          value: new THREE.TextureLoader().load(`images/textures/${shape}.png`),
        },
        radius: {
          type: 'f',
          value: radius,
        },
        size: {
          type: 'f',
          value: size,
        },
        color: {
          type: 'c',
          value: color,
        },
        opacity: {
          type: 'f',
          value: opacity,
        },
        waveform: {
          type: 'fv1',
          value: waveform,
        },
        amplitude: {
          type: 'f',
          value: 1.0,
        },
        fogNear: {
          type: 'f',
          value: 0,
        },
        fogFar: {
          type: 'f',
          value: 0,
        },
        fogColor: {
          type: 'c',
          value: new THREE.Color(),
        },
      },
    })
  }
}

/**
 * RingBufferGeometry
 * The geometry for a single circle of points
 * includes `reference` attribute for vertex shader to associate
 * an individual point to its waveform data.
 * @extends THREE.BufferGeometry
 * @param {Number} [resolution=128]
 */
class RingBufferGeometry extends THREE.BufferGeometry {
  constructor() {
    super(new THREE.BufferGeometry())

    this.resolution = 128

    //position attribute, needs to be there,
    //but its calculated in the vertex shader
    const positions = new Float32Array(this.resolution * 3)
    const posAttribute = new THREE.BufferAttribute(positions, 3)
    this.addAttribute('position', posAttribute)

    //index attribute, each point gets an index for reference on the waveform uniform
    const reference = new Float32Array(this.resolution)
    for (let i = 0; i < this.resolution; i++) {
      reference[i] = i / this.resolution
    }

    const referenceAttribute = new THREE.BufferAttribute(reference, 1)
    this.addAttribute('reference', referenceAttribute)

    //since the positions are set in shader,
    //we need a custom boundingSphere to a void erroneous culling
    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0.52)
  }
}

class LiveScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5

    return (
      <scene ref={this.sceneRef}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
      </scene>
    )
  }
}
export default LiveScene
