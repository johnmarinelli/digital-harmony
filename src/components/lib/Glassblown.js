import React, { useRef } from 'react'
import { MeshLine, MeshLineMaterial } from 'threejs-meshline'
import * as THREE from 'three/src/Three'
import { extend, useRender } from 'react-three-fiber'
import { DASH_OFFSET_DELTA } from '../../util/Constants'

extend({ MeshLine, MeshLineMaterial })

const GlassblownLine = props => {
  const id = props.id
  const totalLines = props.totalLines || 20
  const lineWidth = props.lineWidth || 0.05

  const material = useRef()
  const color = new THREE.Color(0xff0000)
  const ratio = 0.2
  const numPoints = 10
  const radius = 0.25

  const vertices = []

  let turtle = new THREE.Vector3(0, 0, 0)
  for (let i = 0; i < numPoints; ++i) {
    const thetaDeg = id / totalLines * 360.0
    const theta = THREE.Math.degToRad(thetaDeg)
    const phiDeg = i / numPoints * 360.0
    const phi = THREE.Math.degToRad(phiDeg)
    let x = radius * Math.sin(theta) * Math.cos(phi)
    let y = radius * Math.cos(theta)
    let z = radius * Math.sin(theta) * Math.sin(phi)
    turtle.add(new THREE.Vector3(x, y, z))
    vertices.push(turtle.clone())
  }

  useRender(() => (material.current.uniforms.dashOffset.value -= DASH_OFFSET_DELTA))

  return (
    <mesh>
      <meshLine attach="geometry" vertices={vertices} />
      <meshLineMaterial
        attach="material"
        ref={material}
        transparent
        lineWidth={lineWidth}
        color={color}
        dashArray={0.2}
        dashRatio={ratio}
      />
    </mesh>
  )
}

const Glassblown = props => {
  const scale = props.scale || [1, 1, 1]
  const group = useRef()
  const numLines = 20
  const lines = new Array(numLines).fill()
  let theta = 0

  useRender(() => {
    const rotation = 5 * Math.sin(THREE.Math.degToRad((theta += 0.02)))
    group.current.rotation.set(0, rotation, 0)
  })

  return (
    <group ref={group} scale={scale}>
      {lines.map((_, index) => <GlassblownLine key={index} id={index} totalLines={numLines} />)}
    </group>
  )
}

export { Glassblown }
