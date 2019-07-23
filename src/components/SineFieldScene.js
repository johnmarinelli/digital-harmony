import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'

const DifferentialMotion = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()

  const numLines = 12
  const numPoints = 240
  const amplitude = 1.5

  const groupRef = useRef()

  const [geometries, colors] = useMemo(() => {
    const geometries = [],
      colors = []
    let color = new THREE.Color(0x0000ff)

    for (let i = 0; i < numLines; ++i) {
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array(numPoints * 3)
      let x, y, z

      color.r += i * 0.1
      color.g += i * 0.01
      color.b -= i * 0.1

      for (let j = 0; j < numPoints; ++j) {
        x = j / numPoints * 20.0 - 5.0
        y = Math.sin(x) * amplitude
        z = -1

        const verticesBaseIndex = j * 3
        vertices[verticesBaseIndex] = x
        vertices[verticesBaseIndex + 1] = y
        vertices[verticesBaseIndex + 2] = z
      }

      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.computeBoundingSphere()

      geometries.push(geometry)
      colors.push(color.clone())
    }

    return [geometries, colors]
  })

  useRender(() => {
    const diff = clock.getElapsedTime() - timeStart
    let x, y
    for (let i = 0; i < numLines; ++i) {
      const geometry = groupRef.current.children[i].geometry
      const positions = geometry.attributes.position.array
      for (let j = 0; j < numPoints; ++j) {
        const positionsBaseIndex = j * 3
        x = positions[positionsBaseIndex]
        y = 1 / (i + 1) * Math.sin((i + 1) * x + diff) * amplitude
        positions[positionsBaseIndex + 1] = y
      }
      geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group position={new THREE.Vector3(-3.0, 0.0, 0.0)} ref={groupRef}>
      {geometries.map((geometry, i) => {
        return (
          <anim.line key={i} name="mesh" geometry={geometry}>
            <anim.lineBasicMaterial name="material" color={colors[i]} />
          </anim.line>
        )
      })}
    </group>
  )
}

class SineFieldScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    geometry.scale(0.5, 0.5, 0.5)
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }))

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0xff00ff)}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#97082F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <DifferentialMotion />
      </scene>
    )
  }
}

export default SineFieldScene
