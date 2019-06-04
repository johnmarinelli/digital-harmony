import React, { useRef, useState } from 'react'
import * as THREE from 'three/src/Three'
import Background from './Background'
import { apply, useRender, useThree } from 'react-three-fiber'
import clock from '../util/Clock'
import { Uniforms, FragmentShader } from '../shaders/FifthScene'
import { useSpring, interpolate, animated } from 'react-spring/three'
import midi from '../util/WebMidi'
import WavySphere from './WavySphere'
import * as meshline from 'three.meshline'

apply(meshline)

const Lights = () => (
  <>
    <ambientLight color={0xffffff} intensity={0.8} />
    <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
  </>
)

const colors = ['#A2CCB6', '#FCEEB5', '#EE786E', '#EE786E']

const Fatline = () => {
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

  useRender(() => (material.current.uniforms.dashOffset.value -= 0.0005))

  return (
    <mesh position={[0, 0, -2]} rotation={[90, 0, 0]}>
      {/* MeshLine and CatmullRomCurve are OOP factories, so we need imperative code */}
      <meshLine onUpdate={self => (self.parent.geometry = self.geometry)}>
        <geometry onUpdate={self => self.parent.setGeometry(self)}>
          <catmullRomCurve3 args={[curve]} onUpdate={self => (self.parent.vertices = self.getPoints(500))} />
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

function Octahedron({ position = [0, 0, 1] }) {
  const [active, setActive] = useState(false)
  const [hovered, setHover] = useState(false)
  const vertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const { color, pos, ...props } = useSpring({
    color: active ? 'hotpink' : 'white',
    pos: active ? [position.x, position.y, position.z + 2] : position,
    'material-opacity': hovered ? 0.6 : 0.25,
    scale: active ? [1.5, 1.5, 1.5] : [1, 1, 1],
    rotation: active ? [THREE.Math.degToRad(180), 0, THREE.Math.degToRad(45)] : [0, 0, 0],
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 },
  })

  return (
    <group>
      <animated.line position={pos}>
        <geometry attach="geometry" vertices={vertices.map(v => new THREE.Vector3(...v))} />
        <animated.lineBasicMaterial attach="material" color={color} />
      </animated.line>
      <animated.mesh
        onClick={e => {
          console.log(e)
          setActive(!active)
        }}
        onPointerOver={e => setHover(true)}
        onPointerOut={e => setHover(false)}
        {...props}
      >
        <octahedronGeometry attach="geometry" />
        <meshStandardMaterial attach="material" color="grey" transparent />
      </animated.mesh>
    </group>
  )
}

const Content = () => {
  const group = useRef()
  let theta = 0
  const numLines = 20
  const lines = new Array(numLines).fill()

  useRender(() => {
    const rotation = 5 * Math.sin(THREE.Math.degToRad((theta += 0.02)))
    group.current.rotation.set(0, rotation, 0)
  })

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
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
          onClick={e => {
            console.log(e)
          }}
        />
        <Lights />
        <Content />
        <Octahedron />
      </scene>
    )
  }
}

export default FifthScene
