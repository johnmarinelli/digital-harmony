import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import Background from './Background'
import { apply, useRender, useThree } from 'react-three-fiber'
import clock from '../util/Clock'
import { Uniforms, FragmentShader } from '../shaders/FifthScene'
import { interpolate } from 'react-spring/three'
import midi from '../util/WebMidi'
import WavySphere from './WavySphere'
import * as meshline from 'three.meshline'

apply(meshline)

const Lights = () => (
  <>
    <ambientLight color={0xffffff} intensity={0.8} />
    <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
    <WavySphere />
  </>
)

const colors = ['#A2CCB6', '#FCEEB5', '#EE786E', '#EE786E']

const Fatline = () => {
  const material = useRef()
  const [color] = useState(() => colors[parseInt(colors.length * Math.random())])
  const [ratio] = useState(() => 0.5 + 0.5 * Math.random())
  const [width] = useState(() => Math.max(0.1, 0.3 * Math.random()))

  const numPoints = 30

  const [curve] = useState(() => {
    let pos = new THREE.Vector3(30 - 60 * Math.random(), -5, 10 - 20 * Math.random())
    return new Array(numPoints)
      .fill()
      .map(() =>
        pos.add(new THREE.Vector3(2 - Math.random() * 4, 4 - Math.random() * 2, 5 - Math.random() * 10)).clone()
      )
  })

  useRender(() => (material.current.uniforms.dashOffset.value -= 0.0005))

  return (
    <mesh>
      {/* MeshLine and CatmullRomCurve are OOP factories, so we need imperative code */}
      <meshLine onUpdate={self => (self.parent.geometry = self.geometry)}>
        <geometry onUpdate={self => self.parent.setGeometry.set(self)}>
          <catmullRomCurve3 args={[curve]} onUpdate={self => (self.parent.vertices = self.getPoints(500))} />
        </geometry>
      </meshLine>
      <meshLineMaterial
        name="material"
        ref={material}
        transparent
        depthTest={false}
        lineWidth={width}
        color={color}
        dashArray={0.1}
        dashRatio={ratio}
      />
    </mesh>
  )
}

const Content = () => {
  const group = useRef()
  const theta = 0
  const numLines = 100
  const lines = new Array(numLines).fill()

  useRender(() => group.current.rotation.set(0, 5 * Math.sin(THREE.Math.degToRad((theta += 0.02))), 0))

  return <group ref={group}>{lines.map((_, index) => <Fatline key={index} />)}</group>
}

class FifthScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.0

    return (
      <scene ref={this.sceneRef}>
        <Background
          top={top}
          scrollMax={scrollMax}
          color={top.interpolate([0, scrollMax * 0.25, scrollMax * 0.75], ['#ffffff', '#000011', '#000000'])}
          receiveShadow={true}
          depthTest={true}
        />
        <Lights />
        <Content />
        <WavySphere />
      </scene>
    )
  }
}

export default FifthScene
