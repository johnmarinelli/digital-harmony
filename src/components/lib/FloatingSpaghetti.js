import React, { useRef, useState } from 'react'
import * as THREE from 'three/src/Three'
import { useRender } from 'react-three-fiber'
import { DASH_OFFSET_DELTA } from '../../util/Constants'

const colors = ['#A2CCB6', '#FCEEB5', '#EE786E', '#EE786E']

const RandomFatLine = () => {
  const material = useRef()
  const [color] = useState(() => colors[parseInt(colors.length * Math.random())])
  const [ratio] = useState(() => 0.2 + 0.2 * Math.random())
  const [width] = useState(() => Math.max(0.05, 0.13 * Math.random()))

  const numPoints = 10

  const vertices = []

  let turtle = new THREE.Vector3(3 - 6 * Math.random(), -0.5, 1 - 2 * Math.random())

  for (let i = 0; i < numPoints; ++i) {
    const pos = turtle.add(new THREE.Vector3(2 - Math.random() * 4, 2 - Math.random() * 4, 5 - Math.random() * 10))
    vertices.push(pos.clone())
  }

  useRender(() => (material.current.uniforms.dashOffset.value -= DASH_OFFSET_DELTA))

  return (
    <mesh position={[0, 0, -2]} rotation={[90, 0, 0]}>
      <meshLine attach="geometry" vertices={vertices} />
      <meshLineMaterial
        attach="material"
        ref={material}
        transparent
        depthTest={false}
        lineWidth={width}
        color={color}
        dashArray={0.2}
        dashRatio={ratio}
      />
    </mesh>
  )
}

const FatLines = () => {
  const group = useRef()
  let theta = 0
  const numLines = 20
  const lines = new Array(numLines).fill()

  useRender(() => {
    const rotation = 5 * Math.sin(THREE.Math.degToRad((theta += 0.02)))
    group.current.rotation.set(0, rotation, 0)
  })

  return <group ref={group}>{lines.map((_, index) => <RandomFatLine key={index} />)}</group>
}

export { FatLines as FloatingSpaghetti }
