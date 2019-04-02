import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useRender, useThree } from 'react-three-fiber'
import { apply as applySpring, useSpring, animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import { DEG } from '../util/Constants'
import Background from './Background'

const DifferentialMotion = props => {
  let group = useRef()
  let theta = 0

  const timeStart = clock.getElapsedTime()
  const timeScale = props.timeScale || 0.005
  const radius = props.radius || 2

  const numLines = 12
  const numPoints = 60

  const [geometries, materials] = useMemo(() => {
    const geometries = [],
      materials = []
    for (let i = 0; i < numLines; ++i) {
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array(numPoints * 3)
      let x, y, z

      for (let j = 0; j < numPoints; ++j) {
        x = j / numPoints * 10.0
        y = Math.sin(x)
        z = -i

        const verticesBaseIndex = j * 3
        vertices[verticesBaseIndex] = x
        vertices[verticesBaseIndex + 1] = y
        vertices[verticesBaseIndex + 2] = z
      }
      /*
      const vertices = new Float32Array([
        -1.0,
        -1.0,
        -i,
        1.0,
        -1.0,
        -i,
        1.0,
        1.0,
        -i,

        1.0,
        1.0,
        -i,
        -1.0,
        1.0,
        -i,
        -1.0,
        -1.0,
        -i,
      ])
      */

      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
      geometry.computeBoundingSphere()

      geometries.push(geometry)
      materials.push(material)
    }

    return [geometries, materials]
  })

  useRender(() => {
    const diff = clock.getElapsedTime() - timeStart
    for (let i = 0; i < numLines; ++i) {
      const geometry = geometries[i]
      geometry.attributes.position.array[0] += diff * 0.1
      geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group position={new THREE.Vector3(-3.0, 0.0, 0.0)}>
      {geometries.map((geometry, i) => {
        return (
          <anim.line key={i} name="mesh" geometry={geometry}>
            <anim.lineBasicMaterial name="material" color={materials[i].color} />
          </anim.line>
        )
      })}
    </group>
  )
}

class SecondScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0xff00ff)}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#97082F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <anim.group>
          <DifferentialMotion {...this.differentialMotionProps} />
        </anim.group>
      </scene>
    )
  }
}

export default SecondScene
