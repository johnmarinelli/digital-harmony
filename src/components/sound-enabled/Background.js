import React, { useRef } from 'react'
import { Transport } from 'tone'
import * as THREE from 'three'
import { useThree, useRender } from 'react-three-fiber'
import { VertexShader, FragmentShader } from '../../shaders/SoundEnabledBackground'
import { AudioEnabledRawShaderMaterial } from '../../materials/AudioEnabled'
import clock from '../../util/Clock'

class SoundEnabledBackgroundMaterial extends AudioEnabledRawShaderMaterial {
  constructor(options) {
    const { waveformResolution, screenResolution } = options
    const scale = options.scale || 3.0
    super({
      waveformResolution,
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      uniforms: {
        resolution: new THREE.Uniform(new THREE.Vector2(...screenResolution)),
        scale: new THREE.Uniform(scale),
        time: new THREE.Uniform(0.0),
      },
    })
  }
}

const SoundEnabledBackground = props => {
  const { viewport } = useThree()
  const { width, height } = viewport

  let meshRef = useRef()

  const waveformResolution = props.waveformResolution || 128
  const screenResolution = [window.innerWidth, window.innerHeight]
  const { player } = props

  const scale = 1.0

  const material = new SoundEnabledBackgroundMaterial({ waveformResolution, screenResolution, scale })

  let waveform = new Float32Array(waveformResolution)

  const render = () => {
    if (player && Transport.state === 'started') {
      player.getWaveform(waveform)

      if (player && player.isLoaded()) {
        const mesh = meshRef.current
        mesh.material.uniforms.waveform.value = waveform
        mesh.material.uniforms.time.value = clock.getElapsedTime()
      }
    }
  }

  useRender(render)

  return (
    <mesh ref={meshRef} scale={[width, height, 1.0]} material={material} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[1, 1]} />
    </mesh>
  )
}
export { SoundEnabledBackground }
