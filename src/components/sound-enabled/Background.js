import React, { useRef, useEffect } from 'react'
import { Transport } from 'tone'
import * as THREE from 'three'
import { useThree, useRender } from 'react-three-fiber'
import { VertexShader, FragmentShader } from '../../shaders/SoundEnabledBackground'
import { AudioEnabledRawShaderMaterial } from '../../materials/AudioEnabled'

class SoundEnabledBackgroundMaterial extends AudioEnabledRawShaderMaterial {
  constructor(options) {
    const { waveformResolution, screenResolution } = options
    super({
      waveformResolution,
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      uniforms: { resolution: new THREE.Uniform(new THREE.Vector2(...screenResolution)) },
    })
  }
}

const SoundEnabledBackground = props => {
  const { viewport } = useThree()
  const { width, height } = viewport

  let mesh = useRef()

  const waveformResolution = props.waveformResolution || 128
  const screenResolution = [window.innerWidth, window.innerHeight]
  const { player } = props

  const material = new SoundEnabledBackgroundMaterial({ waveformResolution, screenResolution })

  let waveform = new Float32Array(waveformResolution)

  const render = () => {
    if (player && Transport.state === 'started') {
      player.getWaveform(waveform)

      if (player && player.isLoaded()) {
        const soundWave = mesh.current
        soundWave.material.uniforms.waveform.value = waveform
      }
    }
  }

  useRender(render)

  return (
    <mesh ref={mesh} scale={[width, height, 1.0]} material={material} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[1, 1]} />
    </mesh>
  )
}
export { SoundEnabledBackground }
