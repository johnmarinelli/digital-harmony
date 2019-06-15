import React, { useRef, useState } from 'react'
import * as THREE from 'three/src/Three'
import { useRender } from 'react-three-fiber'

const DASH_OFFSET_DELTA = 0.0005
const GlassblownLine = ({ id, totalLines }) => {
  const material = useRef()
  const color = new THREE.Color(0xff0000)
  const width = 0.01
  const ratio = 0.2

  const numPoints = 10
  const radius = 0.25

  const [curve] = useState(() => {
    let pos = new THREE.Vector3(0, 0, 0)
    return new Array(numPoints).fill().map((_, index) => {
      const thetaDeg = id / totalLines * 360.0
      const theta = THREE.Math.degToRad(thetaDeg)
      const phiDeg = index / numPoints * 360.0
      const phi = THREE.Math.degToRad(phiDeg)
      let x = radius * Math.sin(theta) * Math.cos(phi)
      let y = radius * Math.cos(theta)
      let z = radius * Math.sin(theta) * Math.sin(phi)
      pos.add(new THREE.Vector3(x, y, z))

      return pos.clone()
    })
  })

  useRender(() => (material.current.uniforms.dashOffset.value -= DASH_OFFSET_DELTA))

  return (
    <mesh>
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

const Glassblown = () => {
  const group = useRef()
  let theta = 0
  const numLines = 20
  const lines = new Array(numLines).fill()

  useRender(() => {
    //const rotation = 5 * Math.sin(THREE.Math.degToRad((theta += 0.02)))
    //group.current.rotation.set(0, rotation, 0)
  })

  return (
    <group ref={group}>
      {lines.map((_, index) => <GlassblownLine key={index} id={index} totalLines={numLines} />)}
    </group>
  )
}

export default Glassblown
