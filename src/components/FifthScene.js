import React, { useMemo, useRef, useContext, useState, useEffect } from 'react'
import * as THREE from 'three'
import { ShaderBackground } from './Background'
import { useRender, useThree } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import { Uniforms, FragmentShader } from '../shaders/FifthScene'
import { interpolate } from 'react-spring/three'
import Text from './Text'
import midi from '../util/WebMidi'
import GlitchRepeater from './GlitchRepeater'
import * as AnimationHelper from '../util/AnimationHelper'
import * as CANNON from 'cannon'

// Cannon-world context provider
const context = React.createContext()
function Provider({ children }) {
  // physics
  const [world] = useState(() => new CANNON.World())

  useEffect(
    () => {
      world.broadphase = new CANNON.NaiveBroadphase()
      world.solver.iterations = 10
      world.gravity.set(0, 0, -25)
    },
    [world]
  )

  // run world step every frame
  useRender(() => world.step(1 / 60))

  // distribute world via context
  return <context.Provider value={world} children={children} />
}

// hook to maintain world physics body
function useCannon({ ...props }, fn, deps = []) {
  const ref = useRef()

  const world = useContext(context)

  // physics body
  const [body] = useState(() => new CANNON.Body(props))

  useEffect(() => {
    fn(body)

    world.addBody(body)

    // remove body on unmount
    return () => world.removeBody(body)
  })

  useRender(() => {
    if (ref.current) {
      ref.current.position.copy(body.position)
      ref.current.quaternion.copy(body.quaternion)
    }
  })

  return ref
}

const Title = ({ top }) => (
  <>
    <Text
      fontSize={200}
      opacity={top.interpolate([0, 200], [1, 0])}
      position={top.interpolate(top => [0, -1 + top / 200, 0])}
    >
      bwv 775
    </Text>
    <Text
      fontSize={100}
      opacity={top.interpolate([0, 200], [1, 0])}
      position={top.interpolate(top => [3, -2.3 + top / 200, 0])}
    >
      d mol.
    </Text>
  </>
)

const Particles = ({ top, scrollMax }) => {
  const group = useRef()

  const numParticles = 5
  const particleGeometries = ['ico', 'dod', 'cyl']

  const [particles, originalYPositions] = useMemo(() => {
    const particles = [],
      originalYPositions = []
    const getGeometry = (str, props, returnType = 'component') => {
      if (returnType === 'component') {
        if (str === 'ico') return <icosahedronBufferGeometry name="geometry" {...props} />
        if (str === 'dod') return <dodecahedronBufferGeometry name="geometry" {...props} />
        if (str === 'cyl') return <cylinderBufferGeometry name="geometry" {...props} />
      } else if (returnType === 'three') {
        if (str === 'ico') return new THREE.IcosahedronBufferGeometry(props.radius)
        if (str === 'dod') return new THREE.DodecahedronBufferGeometry(props.radius)
        if (str === 'cyl') return new THREE.CylinderBufferGeometry(props.radius)
      }
    }
    let particleGeometriesIndex = 0
    let particleGeometryFn = null
    let x = 0.0,
      y = 0.0,
      z = 1.0

    let radius = 0.3
    let geometry = null
    let material = null

    let xScale = 0.0,
      yScale = 0.0,
      zScale = 0.0

    let mesh = null

    for (let i = 0; i < numParticles; ++i) {
      particleGeometriesIndex = Math.floor(Math.random() * 100.0) % particleGeometries.length
      const geometryString = particleGeometries[particleGeometriesIndex]

      x = (Math.random() - 0.5) * 7.0
      y = (Math.random() - 0.5) * 7.0
      radius = 0.1

      xScale = 0.2 + (Math.random() - 0.5) * 0.01
      yScale = 0.2 + (Math.random() - 0.5) * 0.01
      zScale = 0.2 + (Math.random() - 0.5) * 0.01

      //particle = new particleGeometryFn()

      const props = {
        radius,
      }

      /*
      geometry = getGeometry(geometryString, props, 'three')
      geometry.scale(xScale, yScale, zScale)
      geometry.position = new THREE.Vector3(x, y, z)
      material = new THREE.MeshLambertMaterial({ color: 'white' })

      mesh = new THREE.Mesh(geometry, material)
      particles.push(mesh)
      */
      geometry = getGeometry(geometryString, props, 'component')
      material = new THREE.MeshLambertMaterial({ color: 'white' })

      particles.push(
        <mesh
          key={i}
          position={[x, y, z]}
          scale={[xScale, yScale, zScale]}
          material={new THREE.MeshLambertMaterial({ color: 'white' })}
          castShadow
        >
          {geometry}
        </mesh>
      )
      originalYPositions.push(y)
    }

    return [particles, originalYPositions]
  })

  useRender(() => {
    const { current: { children } } = group

    const numChildren = children.length
    for (let i = 0; i < numChildren; ++i) {
      const child = children[i]
      child.position.x -= 0.01
      if (child.position.x < -3.0) {
        child.position.x = 3.0
      }

      const y = top.interpolate([0, 500], [10.0, originalYPositions[i]])
      child.position.y = y.getValue()
    }
  })

  return <group ref={group}>{particles}</group>
}

const Subject = props => {
  let midiHandlersAdded = false
  let scaleAnimationTime = 0.5 // one-way, in seconds
  const subject = useRef()

  const [geometry, material] = useMemo(() => {
    const geometry = new THREE.DodecahedronBufferGeometry()
    const material = new THREE.MeshLambertMaterial({ color: 'gray' })
    return [geometry, material]
  })

  useRender(() => {
    const { current: mesh } = subject
    const oldY = mesh.position.y
    const { lastNoteOnStartedAt } = midi
    const now = clock.getElapsedTime()

    const factor = AnimationHelper.fadeInThenOutNonPositive(now, midi.lastNoteOnStartedAt, scaleAnimationTime)
    const newY = factor
    mesh.position.y = newY
  })

  return <mesh ref={subject} geometry={geometry} material={material} name="subject" />
}

const DifferentialMotion = props => {
  let group = useRef()

  const { gl } = useThree()
  gl.shadowMap.enabled = true
  gl.shadowMap.type = THREE.PCFSoftShadowMap

  const timeStart = clock.getElapsedTime()

  const [backgroundObjects] = useMemo(
    () => {
      const data = [
        {
          geometryFn: THREE.BoxBufferGeometry,
          geometryFnArgs: [0.5],
          materialFn: THREE.MeshLambertMaterial,
          materialFnArgs: { color: 'white' },
          position: new THREE.Vector3(0.0, 0.0, 1.0),
        },
      ]
      const backgroundObjects = data.map((obj, i) => {
        const { geometryFnArgs, materialFnArgs, position } = obj
        return (
          <mesh
            key={i}
            geometry={new obj.geometryFn(...geometryFnArgs)}
            material={new obj.materialFn(materialFnArgs)}
            position={position}
            castShadow
          />
        )
      })
      return [
        [
          /* TODO: see if i want to use this. */
        ],
      ]
    },
    [props]
  )

  useRender(() => {
    const { current: { children } } = group
    const numChildren = children.length

    const now = clock.getElapsedTime()

    // need to figure out how to update shadows on move
    for (let i = 0; i < numChildren; ++i) {
      if ('subject' === children[i].name) {
        //children[i].position.x = Math.cos(now)
        //children[i].position.y = Math.sin(now)
      }
    }
  })
  const d = 200

  return (
    <group ref={group}>
      <Title top={props.top} />
      <Particles top={props.top} scrollMax={props.scrollMax} />
      <ambientLight color={0xfff} intensity={0.8} />
      <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
      <Subject />
      {backgroundObjects}
    </group>
  )
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
      <scene ref={this.sceneRef} background={new THREE.Color(0x000000)}>
        <ShaderBackground
          top={top}
          scrollMax={scrollMax}
          color={top.interpolate([0, scrollMax * 0.25], ['#B27193', '#AE709E'])}
          fragmentShader={FragmentShader}
          customUniforms={Uniforms()}
          receiveShadow={true}
        />
        <DifferentialMotion top={top} scrollMax={scrollMax} />
      </scene>
    )
  }
}

export default FifthScene
