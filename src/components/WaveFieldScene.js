import React, { useMemo, useRef } from 'react'
import clock from '../util/Clock'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import Background from './Background'
import { animated as anim } from 'react-spring/three'
import * as WaveFieldShader from '../shaders/WaveFieldShader'
import midi from '../util/WebMidi'

const WaveField = props => {
  let group = useRef()

  const position = props.position || [0, 0, 0]

  const numLines = props.numLines || 64
  const numPoints = props.numPoints || 30
  const verticalGutterScale = 0.1
  const verticalCenterOffset = numLines * 0.5 * verticalGutterScale
  const spaceBetweenPoints = 0.1
  const horizontalCenterOffset = numPoints * 0.5 * spaceBetweenPoints
  const startColor = props.startColor || [0.5, 0.4, 0.5]
  const endColor = props.endColor || [0.9, 0.8, 0.7]

  const numLinesToColor = props.numLinesToColor || 5

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

  useRender(() => {
    const now = clock.getElapsedTime()
    for (let i = 0; i < numLines; ++i) {
      const mesh = groupRef.current.children[i]
      mesh.material.uniforms.time.value = now
      mesh.rotation.y += 0.05 * (i / numLines)
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
    <group position={position} {...props} ref={groupRef}>
      {geometries.map((geometry, i) => {
        return <anim.line key={i} geometry={geometry} material={materials[i]} />
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
        <WaveField modulatedIndex={1} />
      </scene>
    )
  }
}
export default WaveFieldScene
