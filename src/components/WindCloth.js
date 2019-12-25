import React, { useRef, useContext, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import * as cannon from 'cannon'
import clock from '../util/Clock'

// todo: clean up global variables
const R = 0.2

const clothMass = 1 // 1 kg in total
const clothSize = 32 // 1 meter
const Nx = 12
const Ny = 12
const mass = clothMass / Nx * Ny

const restDistance = clothSize / Nx

const ballSize = 0.1

const plane = (width, height) => (u, v, target) => {
  var x = (u - 0.5) * width
  var y = (v + 0.5) * height
  var z = 0

  if (target) {
    return target.set(x, y, z)
  }

  return new THREE.Vector3(x, y, z)
}
const clothFunction = plane(restDistance * Nx, restDistance * Ny)

// todo: cleanup "particles"
let particles = []

// Cannon-world context provider
const context = React.createContext()
function Provider({ children }) {
  // physics
  const [world] = useState(() => new cannon.World())

  useEffect(
    () => {
      world.broadphase = new cannon.NaiveBroadphase()
      world.gravity.set(0, -9.82, 0)
      world.solver.iterations = 20

      const clothMaterial = new cannon.Material()
      const sphereMaterial = new cannon.Material()
      const clothSphereContactMaterial = new cannon.ContactMaterial(
        clothMaterial,
        sphereMaterial,
        0.0, // friction coefficient,
        0.0 // restitution
      )
      clothSphereContactMaterial.contactEquationStiffness = 1e9
      clothSphereContactMaterial.contactEquationRelaxation = 3

      world.addContactMaterial(clothSphereContactMaterial)

      for (let i = 0, il = Nx + 1; i !== il; i++) {
        particles.push([])

        for (let j = 0, jl = Ny + 1; j !== jl; ++j) {
          const p = clothFunction(i / (Nx + 1), j / (Ny + 1))
          const particle = new cannon.Body({ mass: j == Ny ? 0 : mass })
          particle.addShape(new cannon.Particle())
          particle.linearDamping = 0.01
          particle.position.set(p.x, p.y - Ny * 0.9 * restDistance, p.z)
          particles[i].push(particle)
          world.add(particle)
          particle.velocity.set(0, 0, -0.1 * (Ny - j))
        }
      }

      const connect = (i1, j1, i2, j2) => {
        world.addConstraint(new cannon.DistanceConstraint(particles[i1][j1], particles[i2][j2], restDistance))
      }

      for (let i = 0; i < Nx + 1; i++) {
        for (let j = 0; j < Ny + 1; j++) {
          if (i < Nx) connect(i, j, i + 1, j)
          if (j < Ny) connect(i, j, i, j + 1)
        }
      }
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
  const [body] = useState(() => new cannon.Body(props))

  useEffect(
    () => {
      fn(body)

      world.addBody(body)

      // remove body on unmount
      return () => world.removeBody(body)
    },
    [world]
  )

  useRender(() => {
    if (ref.current) {
      ref.current.position.copy(body.position)
      ref.current.quaternion.copy(body.quaternion)
    }
  })

  return ref
}

const Cloth = props => {
  const position = props.position || [0, 0, 0]
  const clothTexture = THREE.ImageUtils.loadTexture('/textures/cloth/circuit_pattern.png') // circuit_pattern.png
  clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping
  clothTexture.anisotropy = 16

  const geometry = new THREE.ParametricGeometry(clothFunction, Nx, Ny, true)
  geometry.dynamic = true
  geometry.computeFaceNormals()

  useRender(() => {
    for (let i = 0, il = Nx + 1; i !== il; i++) {
      for (let j = 0, jl = Ny + 1; j !== jl; j++) {
        let idx = j * (Nx + 1) + i
        geometry.vertices[idx].copy(particles[i][j].position)
      }
    }

    geometry.computeFaceNormals()
    geometry.computeVertexNormals()

    geometry.normalsNeedUpdate = true
    geometry.verticesNeedUpdate = true
  })

  return (
    <mesh geometry={geometry} castShadow position={position}>
      <meshPhongMaterial
        alphaTest={0.5}
        ambient={0x000000}
        color={0xffffff}
        specular={0x333333}
        emissive={0x222222}
        map={clothTexture}
        side={THREE.DoubleSide}
        attach="material"
      />
    </mesh>
  )
}

const Lights = () => {
  const d = 0.5
  const directionalLightPosition = [d, d, d]
  return (
    <group>
      <ambientLight color={0x666666} />
      <directionalLight
        color={0xffffff}
        intensity={1.75}
        position={directionalLightPosition}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-d}
        shadow-camera-right={d}
        shadow-camera-top={d}
        shadow-camera-bottom={-d}
        shadow-camera-far={3 * d}
        shadow-camera-near={d}
      />
    </group>
  )
}

const Sphere = () => {
  // todo: make this cleaner lol
  let sphereBody = null
  const ref = useCannon({ mass: 0 }, body => {
    const sphereShape = new cannon.Sphere(ballSize * 1.3)
    body.addShape(sphereShape)
    body.position.set(0, 0, 0)
    sphereBody = body
  })

  useRender(() => {
    const t = clock.getElapsedTime()
    const pos = [R * Math.sin(t), 0, R * Math.cos(t)]
    if (sphereBody) {
      sphereBody.position.set(...pos)
    }
    ref.current.position.set(...pos)
  })

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry attach="geometry" args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color={0xa0a0a0} transparent opacity={0.0} attach="material" />
    </mesh>
  )
}

const WindCloth = () => {
  return (
    <Provider>
      <Cloth position={[0, 0, -3]} />
      <Sphere />
      <Lights />
    </Provider>
  )
}

export { WindCloth }
