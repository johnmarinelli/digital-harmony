import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ShaderBackground } from './Background'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import { Uniforms, FragmentShader } from '../shaders/FifthScene'

const Particles = () => {
  const group = useRef()

  const numParticles = 5
  const particleGeometries = ['ico', 'dod', 'cyl']

  const [particles] = useMemo(() => {
    const particles = []
    const getGeometry = (str, props) => {
      if (str === 'ico') return <icosahedronBufferGeometry name="geometry" {...props} />
      if (str === 'dod') return <dodecahedronBufferGeometry name="geometry" {...props} />
      if (str === 'cyl') return <cylinderBufferGeometry name="geometry" {...props} />
    }
    let particleGeometriesIndex = 0
    let particleGeometryFn = null
    let x = 0.0,
      y = 0.0,
      z = 1.0

    let radius = 0.3
    let position = null
    let geometry = null

    let xScale = 0.0,
      yScale = 0.0,
      zScale = 0.0

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
      position = new THREE.Vector3(x, y, z)

      const props = {
        radius,
      }

      geometry = getGeometry(geometryString, props)

      particles.push(
        <mesh
          key={i}
          position={position}
          scale={[xScale, yScale, zScale]}
          material={new THREE.MeshLambertMaterial({ color: 'white' })}
        >
          {geometry}
        </mesh>
      )
    }

    return [particles]
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
    }
  })

  return <group ref={group}>{particles}</group>
}

const DifferentialMotion = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()

  const [staticObjects] = useMemo(
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
      const staticObjects = data.map((obj, i) => {
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
      return [staticObjects]
    },
    [props]
  )

  useRender(() => {
    const { current: { children } } = group
    const numChildren = children.length

    const now = clock.getElapsedTime()

    // need to figure out how to update shadows on move
    for (let i = 0; i < numChildren; ++i) {
      if ('Mesh' === children[i].constructor.name) {
        children[i].position.x = Math.cos(now)
        children[i].position.y = Math.sin(now)
      }
    }
  })
  const d = 200

  return (
    <group ref={group}>
      <ambientLight color={0xfff} intensity={0.8} />
      <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
      {staticObjects}
      <Particles />
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
        <DifferentialMotion />
      </scene>
    )
  }
}

export default FifthScene
