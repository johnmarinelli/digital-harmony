import React, { useRef, useState } from 'react'
import * as THREE from 'three/src/Three'
import { useRender } from 'react-three-fiber'

const DASH_OFFSET_DELTA = 0.005

const SprinklerLine = ({ id, totalLines }) => {
  const material = useRef()
  const color = new THREE.Color(0xff0000)
  color.g = id / totalLines
  const width = 0.05
  const ratio = 0.95

  const numPoints = 10
  const radius = 0.75

  const [curve] = useState(() => {
    let pos = new THREE.Vector3(0, 0, 0)
    return new Array(numPoints).fill().map((_, index) => {
      const phi = THREE.Math.mapLinear(id, 0, totalLines, 0, Math.PI * 2)
      const theta = THREE.Math.mapLinear(index, 0, numPoints, 0, Math.PI * 2)
      let x = radius * Math.sin(theta) * Math.cos(phi)
      let y = radius * Math.sin(theta) * Math.sin(phi)
      let z = radius * Math.cos(theta)
      pos.add(new THREE.Vector3(x, y, z))

      return pos.clone()
    })
  })

  useRender(() => (material.current.uniforms.dashOffset.value -= DASH_OFFSET_DELTA))

  return (
    <mesh position={[-radius, 0, 0]}>
      {/* MeshLine and CatmullRomCurve are OOP factories, so we need imperative code */}
      <meshLine onUpdate={self => (self.parent.geometry = self.geometry)}>
        <geometry onUpdate={self => self.parent.setGeometry(self)}>
          <catmullRomCurve3 args={[curve]} onUpdate={self => (self.parent.vertices = self.getPoints(50))} />
        </geometry>
      </meshLine>
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

const Sprinkler = () => {
  const group = useRef()
  let theta = 0
  const numLines = 20
  const lines = new Array(numLines).fill()

  useRender(() => {
    const rotation = 5 * Math.sin(THREE.Math.degToRad((theta += 0.02)))
    group.current.rotation.set(0, 0, rotation)
  })

  return (
    <group ref={group}>{lines.map((_, index) => <SprinklerLine key={index} id={index} totalLines={numLines} />)}</group>
  )
}

export default Sprinkler
