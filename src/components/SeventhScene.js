import React, { useRef, useContext, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import * as CANNON from 'cannon'
import MeshifyShader from '../shaders/MeshifyShader'
import clock from '../util/Clock'

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

const Lights = () => (
  <>
    <ambientLight color={0xffffff} intensity={0.8} />
    <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
  </>
)

function Plane({ position = [0, 0, 0] }) {
  const ref = useCannon({ mass: 0 }, body => {
    body.addShape(new CANNON.Plane())
    body.position.set(...position)
  })
  return (
    <mesh ref={ref} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[1, 1]} />
      <meshPhongMaterial attach="material" color="#272727" />
    </mesh>
  )
}

function Box({ position }) {
  const ref = useCannon({ mass: 1 }, body => {
    body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 0.1)))
    body.position.set(...position)
  })

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry attach="geometry" args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial attach="material" />
    </mesh>
  )
}

const Boxes = () => {
  return (
    <>
      <Box position={[1, 0, 1]} />
      <Box position={[2, 1, 5]} />
      <Box position={[0, 0, 6]} />
      <Box position={[-1, 1, 8]} />
      <Box position={[-2, 2, 13]} />
      <Box position={[2, -1, 13]} />
    </>
  )
}

const Video = () => {
  const video = document.getElementById('eisbach_surfing')
  video.loop = true
  video.play()
  const texture = new THREE.VideoTexture(video)
  const parameters = MeshifyShader({ texture, resolution: [window.innerWidth, window.innerHeight] })
  const material = new THREE.ShaderMaterial(parameters)
  const geometry = <planeBufferGeometry attach="geometry" args={[13, 10]} />

  useRender(() => {
    material.uniforms.time.value = clock.getElapsedTime()
  })

  return <mesh material={material}>{geometry}</mesh>
}

class SeventhScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0x000000)}>
        <Lights />
        <Video />
        <Provider />
      </scene>
    )
  }
}

export default SeventhScene
