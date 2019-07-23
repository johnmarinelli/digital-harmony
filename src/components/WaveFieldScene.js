import React, { useMemo, useRef } from 'react'
import clock from '../util/Clock'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import Background from './Background'
import { animated as anim } from 'react-spring/three'
import * as WaveFieldShader from '../shaders/WaveFieldShader'
import midi from '../util/WebMidi'
import * as AnimationHelper from '../util/AnimationHelper'

const WaveField = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()

  const numLines = 128
  const numPoints = 120
  const amplitude = 1.5

  const groupRef = useRef()

  const [geometries, materials] = useMemo(() => {
    const geometries = []
    const materials = []

    for (let i = 0; i < numLines; ++i) {
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array(numPoints * 3)
      const colors = new Float32Array(numPoints * 3)
      let x, y, z, indexScaled
      y = i * 0.1 - 7.0

      for (let j = 0; j < numPoints; ++j) {
        indexScaled = j / numPoints
        x = indexScaled * 20.0 - 5.0
        z = -1

        const verticesBaseIndex = j * 3
        vertices[verticesBaseIndex] = x
        vertices[verticesBaseIndex + 1] = y
        vertices[verticesBaseIndex + 2] = z

        colors[verticesBaseIndex] = indexScaled
        colors[verticesBaseIndex + 1] = indexScaled
        colors[verticesBaseIndex + 2] = indexScaled * 0.5
      }

      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.originalColors = new Float32Array(colors)
      geometry.computeBoundingSphere()

      geometries.push(geometry)

      const material = new THREE.ShaderMaterial({
        uniforms: WaveFieldShader.Uniforms(props.modulatedIndex),
        vertexShader: WaveFieldShader.VertexShader,
        fragmentShader: WaveFieldShader.FragmentShader,
        vertexColors: THREE.VertexColors,
      })
      materials.push(material)
    }

    return [geometries, materials]
  })

  midi.addListener(
    'noteon',
    note => {
      const { number } = note
      // range: 36 - 96
      const lineIndex = Math.round((number - 36) / 60 * numPoints)
      let indexScaled
      let colorArray = geometries[lineIndex].attributes.color.array
      let originalColorArray = geometries[lineIndex].originalColors
      let r, g, b

      for (let j = 0; j < numPoints; ++j) {
        indexScaled = j / numPoints
        const verticesBaseIndex = j * 3
        r = originalColorArray[verticesBaseIndex]
        g = originalColorArray[verticesBaseIndex + 1]
        b = originalColorArray[verticesBaseIndex + 2]
        /*
        colorArray[verticesBaseIndex] = Math.min(1.0, r + 0.2)
        colorArray[verticesBaseIndex + 1] = Math.min(1.0, g + 0.2)
        colorArray[verticesBaseIndex + 2] = Math.min(1.0, b + 0.2)
           */
      }
      geometries[lineIndex].attributes.color.needsUpdate = true
    },
    'WaveFieldSceneCurrentNoteNumber'
  )

  useRender(() => {
    const now = clock.getElapsedTime()
    for (let i = 0; i < numLines; ++i) {
      const mesh = groupRef.current.children[i]
      mesh.material.uniforms.time.value = now
    }
    for (let i = 0; i < midi.lastNotes.length; ++i) {
      const number = midi.lastNotes[i]
      const note = midi.noteArray[number]
      const startedAt = note.startedAt
      const lineIndex = Math.round((number - 36) / 60 * numPoints)
      const mesh = groupRef.current.children[lineIndex]
      const mesh2 = groupRef.current.children[lineIndex + 1]
      mesh.material.uniforms.startedAt.value = startedAt
      mesh2.material.uniforms.startedAt.value = startedAt
    }
  })

  return (
    <group position={[-3, 0, 0]} {...props} ref={groupRef}>
      {geometries.map((geometry, i) => {
        return <anim.line key={i} name="mesh" geometry={geometry} material={materials[i]} />
      })}
    </group>
  )
}

class WaveFieldScene extends React.Component {
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
        <WaveField position={[0, -3, 0]} rotation={[0, 0, THREE.Math.degToRad(45)]} modulatedIndex={0} />
        <WaveField modulatedIndex={1} />
      </scene>
    )
  }
}
export default WaveFieldScene
