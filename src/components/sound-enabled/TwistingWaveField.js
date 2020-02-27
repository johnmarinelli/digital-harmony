import React, { useMemo, useRef } from 'react'
import { Transport } from 'tone'
import { AudioEnabledShaderMaterial } from '../../materials/AudioEnabled'
import { withSong } from '../HoC/WithSong'
import clock from '../../util/Clock'
import { extend, useRender } from 'react-three-fiber'
import * as THREE from 'three'
import { animated as anim } from 'react-spring/three'
import * as WaveFieldShader from '../../shaders/WaveFieldShader'
import midi from '../../util/WebMidi'

/*eslint no-useless-constructor: 0 */
class TwistingWaveFieldMaterial extends AudioEnabledShaderMaterial {
  constructor(options) {
    super(options)
  }
}

const WaveField = props => {
  let group = useRef()

  const position = props.position || [0, 0, 0]
  const rotation = props.rotation || [0, 0, 0]

  const numLines = props.waveformResolution || 64
  const numPoints = props.numPoints || 30
  const verticalGutterScale = 0.1
  const verticalCenterOffset = numLines * 0.5 * verticalGutterScale
  const spaceBetweenPoints = 0.1
  const horizontalCenterOffset = numPoints * 0.5 * spaceBetweenPoints
  const startColor = props.startColor || [0.5, 0.4, 0.5]
  const endColor = props.endColor || [0.9, 0.8, 0.7]

  const numLinesToColor = props.numLinesToColor || 5

  const { player } = props

  const groupRef = useRef()

  const [geometries, materials] = useMemo(() => {
    const geometries = []
    const materials = []

    for (let i = 0; i < numLines; ++i) {
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array(numPoints * 3)
      const colors = new Float32Array(numPoints * 3)
      let x, y, z, indexScaled
      y = i * 0.1 - verticalCenterOffset
      z = 0

      for (let j = 0; j < numPoints; ++j) {
        indexScaled = j / numPoints
        x = indexScaled * horizontalCenterOffset

        const verticesBaseIndex = j * 3
        vertices[verticesBaseIndex] = x
        vertices[verticesBaseIndex + 1] = y
        vertices[verticesBaseIndex + 2] = z

        colors[verticesBaseIndex] = THREE.Math.lerp(startColor[0], endColor[0], indexScaled)
        colors[verticesBaseIndex + 1] = THREE.Math.lerp(startColor[1], endColor[1], indexScaled)
        colors[verticesBaseIndex + 2] = THREE.Math.lerp(startColor[2], endColor[2], indexScaled)
      }

      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.computeBoundingSphere()

      geometries.push(geometry)

      const material = new TwistingWaveFieldMaterial({
        uniforms: WaveFieldShader.Uniforms(props.modulatedIndex),
        vertexShader: WaveFieldShader.VertexShader,
        fragmentShader: WaveFieldShader.FragmentShader,
        vertexColors: THREE.VertexColors,
        waveformResolution: props.waveformResolution,
      })
      materials.push(material)
    }

    return [geometries, materials]
  })

  let waveforms = []
  for (let i = 0; i < numLines; ++i) {
    waveforms.push(new Float32Array(props.waveformResolution))
  }

  useRender(() => {
    const now = clock.getElapsedTime()
    for (let i = 0; i < numLines; ++i) {
      const mesh = groupRef.current.children[i]
      mesh.material.uniforms.time.value = now
      //mesh.rotation.y += 0.05 * (i / numLines)
    }

    if (player && Transport.state === 'started' && player.isLoaded()) {
      const parent = groupRef.current
      const children = parent.children

      const wf = waveforms.pop()
      player.getWaveform(wf)
      waveforms.unshift(wf)

      for (let i = 0; i < children.length; ++i) {
        const child = children[i]
        if (i === 0) {
          //console.log(child.material.uniforms)
        }
        child.material.uniforms.waveform.value = waveforms[i]
        //child.transitionStep(ease(t))
      }
    }

    let baseLineIndex, lineIndex, startedAt, note, number
    for (let i = 0; i < midi.lastNotes.length; ++i) {
      number = midi.lastNotes[i]
      note = midi.noteArray[number]
      startedAt = note.startedAt
      baseLineIndex = number - 36

      for (let j = -numLinesToColor; j < numLinesToColor; ++j) {
        lineIndex = baseLineIndex + j

        if (lineIndex < 0 || lineIndex >= numLines) {
          continue
        }

        const mesh = groupRef.current.children[lineIndex]
        mesh.material.uniforms.startedAt.value = startedAt
      }
    }
  })

  return (
    <group position={position} rotation={rotation} ref={groupRef}>
      {geometries.map((geometry, i) => {
        return <anim.line key={i} geometry={geometry} material={materials[i]} />
      })}
    </group>
  )
}

class TwistingWaveFields extends React.PureComponent {
  constructor() {
    super()
    const tracks = ['battery', 'guitar']
    const waves = []
    for (let i = 0; i < tracks.length; ++i) {
      const wave = (
        <WaveField
          position={[-i * 2, 0, 0]}
          waveformResolution={128}
          color={new THREE.Color(0xffff00)}
          opacity={1.0}
          name={tracks[i]}
        />
      )
      waves.push(wave)
    }

    const Song = withSong(waves, 'take_me_out', 3)
    extend({ Song })
    this.Song = <Song />
  }

  render() {
    return <group>{this.Song}</group>
  }
}
export { WaveField as TwistingWaveField, TwistingWaveFields }
