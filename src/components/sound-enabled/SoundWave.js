import React, { useRef } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import { Transport } from 'tone'
import { VertexShader, FragmentShader } from '../../shaders/SoundWave'
import { AudioEnabledLineMaterial } from '../../materials/AudioEnabled'
import { AudioEnabledBufferGeometry } from '../../geometries/AudioEnabled'

class SoundWaveMaterial extends AudioEnabledLineMaterial {
  /*
   * @param options: {
   *   opacity: 1,
   *   size: 1,
   *   radius: 1.0,
   *   color: new THREE.Color(0xff00ff),
   *   waveformResolution: 128,
   * }
  */
  constructor(options) {
    const { opacity, size, waveformResolution, color } = options
    super({
      waveformResolution,
      fog: true,
      blending: THREE.NormalBlending,
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      transparent: true,
      uniforms: {
        amplitude: { type: 'f', value: 1.2 },
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

class SoundWaveBufferGeometry extends AudioEnabledBufferGeometry {
  constructor(options) {
    super(options)
    const numPoints = options.waveformResolution
    const vertices = new Float32Array(numPoints * 3)
    let x, y, z

    for (let j = 0; j < numPoints; ++j) {
      x = j / numPoints * 20.0 - 5.0
      y = 0
      z = 0

      const verticesBaseIndex = j * 3
      vertices[verticesBaseIndex] = x
      vertices[verticesBaseIndex + 1] = y
      vertices[verticesBaseIndex + 2] = z
    }
    this.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
  }
}

/**
 * SoundWave
 * the `Object3D` for a sine wave that is controlled by audio data
 */
const SoundWave = props => {
  const { player } = props
  const ref = useRef()

  let waveform = new Float32Array(props.waveformResolution)

  const render = () => {
    if (player && Transport.state === 'started') {
      player.getWaveform(waveform)

      if (player && player.isLoaded()) {
        const soundWave = ref.current
        soundWave.material.uniforms.waveform.value = waveform
      }
    }
  }

  useRender(render)
  const geom = new SoundWaveBufferGeometry({ waveformResolution: props.waveformResolution })
  const material = new SoundWaveMaterial(props)
  const line = new THREE.Line(geom, material)

  return <primitive position={props.position || [0, 0, 0]} object={line} ref={ref} />
}
export { SoundWave }
