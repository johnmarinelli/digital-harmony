import React, { useRef, useState } from 'react'
import * as THREE from 'three/src/Three'
import { useRender } from 'react-three-fiber'

const colors = ['#A2CCB6', '#FCEEB5', '#EE786E', '#EE786E']

const DASH_OFFSET_DELTA = 0.0005

const RandomFatLine = () => {
  const material = useRef()
  const [color] = useState(() => colors[parseInt(colors.length * Math.random())])
  const [ratio] = useState(() => 0.2 + 0.2 * Math.random())
  const [width] = useState(() => Math.max(0.05, 0.13 * Math.random()))

  const numPoints = 10

  const [curve] = useState(() => {
    let pos = new THREE.Vector3(3 - 6 * Math.random(), -0.5, 1 - 2 * Math.random())
    //let pos = new THREE.Vector3(0, 0, 0)
    return new Array(numPoints)
      .fill()
      .map(() =>
        pos.add(new THREE.Vector3(2 - Math.random() * 4, 2 - Math.random() * 4, 5 - Math.random() * 10)).clone()
      )
  })

  useRender(() => (material.current.uniforms.dashOffset.value -= DASH_OFFSET_DELTA))

  return (
    <mesh position={[0, 0, -2]} rotation={[90, 0, 0]}>
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

export default FatLines
