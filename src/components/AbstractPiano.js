import React, { useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring/three'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import { Noise } from '../util/Noise'
import clock from '../util/Clock'
import { DEG_TO_RAD } from '../util/Constants.js'
import midi from '../util/WebMidi'

Noise.seed(0.1)

const PianoKey = props => {
  const meshRef = useRef()
  const position = props.position || [0, 0, 0]
  const [width, height, depth] = props.dimensions || [1, 0.2, 0.1]
  const color = props.color || 0xefefef

  const midiKey = props.midiKey || 68

  const [spring, set] = useSpring(() => ({
    from: { rotation: [0, 0, 0], position },
    config: { mass: 20, tension: 500, friction: 200 },
  }))

  let extraData = {
    originalPosition: position,
    movementAmount: 0.5,
  }

  useEffect(
    () => {
      midi.onNotePress(note => {
        const { current: mesh } = meshRef
        const currentRotation = mesh.rotation
        const currentPosition = mesh.position

        const newPosition = [2.0, currentPosition.y, currentPosition.z + extraData.movementAmount]
        const newRotation = [currentRotation.x + 25 * Math.PI * DEG_TO_RAD, currentRotation.y, currentRotation.z]

        set({ rotation: newRotation, position: newPosition })
      }, midiKey)

      midi.onNoteRelease(note => {
        const { current: mesh } = meshRef
        const currentPosition = mesh.position

        const newPosition = [extraData.originalPosition[0], currentPosition.y, extraData.originalPosition[2]]
        set({ position: newPosition })
      }, midiKey)
    },
    [spring]
  )

  return (
    <animated.mesh position={spring.position} ref={meshRef} rotation={spring.rotation} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} attach="geometry" />
      <meshPhongMaterial color={color} attach="material" />
    </animated.mesh>
  )
}

const ChordLight = props => {
  const groupRef = useRef()
  const midiKey = props.midiKey
  const color = props.color || 0xffffff
  const position = props.position || [0, 0, 0]

  const [spring, set] = useSpring(() => ({
    from: { rotation: [0, 0, 0], position },
    config: { mass: 20, tension: 500, friction: 200 },
  }))

  let extraData = {
    movementAmount: 1.0,
    originalPosition: position,
  }

  useEffect(
    () => {
      midi.onNotePress(note => {
        if (midi.numNotesCurrentlyDown > 2) {
          const { current: group } = groupRef
          const currentRotation = group.rotation
          const currentPosition = group.position

          const newPosition = [currentPosition.x, currentPosition.y - 0.3, currentPosition.z + extraData.movementAmount]
          const newRotation = [currentRotation.x + 25 * Math.PI * DEG_TO_RAD, currentRotation.y, currentRotation.z]

          set({ rotation: newRotation, position: newPosition })
        }
      }, midiKey)

      midi.onNoteRelease(note => {
        const { current: group } = groupRef
        const currentPosition = group.position

        const newPosition = [extraData.originalPosition[0], currentPosition.y, extraData.originalPosition[2]]
        set({ position: newPosition })
      }, midiKey)
    },
    [spring]
  )

  return (
    <animated.group position={spring.position} ref={groupRef}>
      <mesh position={[0.1, 0.1, 0.1]}>
        <sphereGeometry args={[0.1]} attach="geometry" />
        <meshPhongMaterial color={0xffffff} attach="material" />
      </mesh>
      <mesh position={[-0.1, 0.1, 0.1]}>
        <sphereGeometry args={[0.1]} attach="geometry" />
        <meshPhongMaterial color={0xffffff} attach="material" />
      </mesh>
      <mesh position={[0.1, -0.1, 0.1]}>
        <sphereGeometry args={[0.1]} attach="geometry" />
        <meshPhongMaterial color={0xffffff} attach="material" />
      </mesh>
      <spotLight color={color} intensity={0.1} />
    </animated.group>
  )
}

const ChordLights = props => {
  const numLights = 12

  const lights = []

  for (let i = 0; i < numLights; ++i) {
    const x = Math.random() * 2
    const y = THREE.Math.lerp(2, -2, i / numLights)
    const z = Math.random()
    const color = 0xffffff * (i / numLights)
    const midiKey = 48 + i + 1

    lights.push(<ChordLight position={[x, y, z]} color={color} midiKey={midiKey} key={i} />)
  }

  return <group>{lights}</group>
}

const Keys = props => {
  const numKeys = 25

  const keys = []
  for (let i = 0; i < numKeys; ++i) {
    //const x = THREE.Math.lerp(-1, 1, i / numKeys)
    const x = -2
    const y = THREE.Math.lerp(2, -2, i / numKeys)
    const width = 1.75
    const height = 0.2 / (numKeys / 9)
    const depth = 0.2
    const key = (
      <PianoKey
        position={[x, y, 0]}
        key={i}
        dimensions={[width, height, depth]}
        midiKey={48 + i}
        color={0x111111 * (i / numKeys) * 0xefefef}
      />
    )
    keys.push(key)
  }

  return <group>{keys}</group>
}

const CenterLine = props => {
  const numPoints = 10
  let vertices = []
  let turtle = new THREE.Vector3(0, 3, -0.1)

  for (let i = 0; i < numPoints; ++i) {
    const pos = turtle.add(new THREE.Vector3(0, -0.5, 0))
    vertices.push(pos.clone())
  }
  return (
    <mesh>
      <meshLine attach="geometry" vertices={vertices} />
      <meshLineMaterial attach="material" transparent lineWidth={0.1} color={0xa0a0a0} />
    </mesh>
  )
}

const randomLightPosition = () => {
  return {
    position: [2, Math.random() * 2, 5],
  }
}

const MovingLight = props => {
  const [spring, set] = useSpring(() => ({
    from: { position: [-3, 0, 5] },
    config: { mass: 1, tension: 500, friction: 20 },
  }))
  useEffect(() => void setInterval(() => set(i => ({ ...randomLightPosition() })), 5000), [])

  return (
    <animated.group position={spring.position}>
      <mesh scale={[0.2, 0.2, 0.2]}>
        <boxGeometry attach="geometry" />
        <meshBasicMaterial color={0xffffff} attach="material" />
      </mesh>
      <pointLight color={0xefefef} intensity={0.3} angle={0.2} penumbra={1} castShadow />
    </animated.group>
  )
}

const Background = props => {
  return (
    <mesh position={[0, 0, -1]} scale={[8, 8, 8]} receiveShadow>
      <planeGeometry attach="geometry" />
      <meshPhongMaterial color={0x383838} attach="material" />
    </mesh>
  )
}

const AbstractPiano = props => {
  return (
    <group>
      <Background />
      <MovingLight />
      <CenterLine />
      <Keys />
      <ChordLights />
    </group>
  )
}

export { AbstractPiano }
