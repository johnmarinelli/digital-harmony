import React, { useState, useEffect } from 'react'
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

const Lights = () => (
  <>
    <ambientLight color={0xffffff} intensity={0.8} />
    <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
  </>
)

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
