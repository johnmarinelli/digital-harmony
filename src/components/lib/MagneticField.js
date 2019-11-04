import React, { useRef } from 'react'
import * as THREE from 'three/src/Three'
import { useRender } from 'react-three-fiber'

const DASH_OFFSET_DELTA = 0.0005

const MagneticFieldLine = ({ id, totalLines }) => {
  const material = useRef()
  const color = new THREE.Color(0xff0000)
  const width = 0.05
  const ratio = 0.05

  const numPoints = 10
  const radius = 0.5

  const vertices = []

  let turtle = new THREE.Vector3(0, 0, 0)
  for (let i = 0; i < numPoints; ++i) {
    const phi = THREE.Math.mapLinear(id, 0, totalLines, 0, Math.PI * 2)
    const theta = THREE.Math.mapLinear(i, 0, numPoints, 0, Math.PI * 2)
    let x = radius * Math.sin(theta) * Math.cos(phi)
    let z = radius * Math.sin(theta) * Math.sin(phi)
    let y = radius * Math.cos(theta)
    turtle.add(new THREE.Vector3(x, y, z))
    vertices.push(turtle.clone())
  }

  useRender(() => (material.current.uniforms.dashOffset.value -= DASH_OFFSET_DELTA))

  return (
    <mesh position={[0, 0, 0]}>
      <meshLine attach="geometry" vertices={vertices} />
      <meshLineMaterial
        attach="material"
        ref={material}
        transparent
        lineWidth={width}
        color={color}
        dashArray={0.2}
        dashRatio={ratio}
      />
    </mesh>
  )
}

const MagneticField = () => {
  const group = useRef()
  const numLines = 20
  const lines = new Array(numLines).fill()
  return (
    <group ref={group}>
      {lines.map((_, index) => <MagneticFieldLine key={index} id={index} totalLines={numLines} />)}
    </group>
  )
}

export { MagneticField }
