import React, { useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring/three'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import { Noise } from '../util/Noise'
import clock from '../util/Clock'
import { DEG_TO_RAD } from '../util/Constants.js'
import midi from '../util/WebMidi'

const NoteModel = props => {
  return (
    <group>
      <mesh>
        <sphereGeometry attach="geometry" />
        <meshBasicMaterial attach="material" />
      </mesh>
    </group>
  )
}

Noise.seed(0.1)
const PianoKey = props => {
  const meshRef = useRef()
  const position = props.position || [0, 0, 0]
  const [width, height, depth] = props.dimensions || [1, 0.2, 0.1]
  const color = props.color || 0xefefef

  const midiKey = props.midiKey || 68

  const [spring, set] = useSpring(() => ({
    from: { rotation: [0, 0, 0] },
    config: { mass: 20, tension: 500, friction: 200 },
  }))

  useEffect(
    () => {
      midi.onNotePress(note => {
        set({ rotation: [0, Math.abs(Math.random() * 1000.0 * DEG_TO_RAD), 0] })
      }, midiKey)
    },
    [spring]
  )

  return (
    <animated.mesh position={position} ref={meshRef} rotation={spring.rotation}>
      <boxGeometry args={[width, height, depth]} attach="geometry" />
      <meshBasicMaterial color={color} attach="material" />
    </animated.mesh>
  )
}

const Keys = props => {
  const numKeys = 10

  const keys = []
  for (let i = 0; i < numKeys; ++i) {
    //const x = Noise.perlin2(i / 10, (i + 1) / 10) * 2
    //const y = Noise.perlin2(i / 10, (i - 1) / 10) * 5
    const x = THREE.Math.lerp(-1, 1, i / numKeys)
    const y = THREE.Math.lerp(2, -2, i / numKeys)
    const width = Math.max(1.1, Noise.perlin2(x, y) * 5)
    const height = 0.2
    const depth = 0.2
    const key = <PianoKey position={[x, y, 0]} key={i} dimensions={[width, height, depth]} midiKey={60 + i} />
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

const AbstractPiano = props => {
  return (
    <group>
      <spotLight color={0xffffff} intensity={0.7} position={[3, 0, 2]} angle={0.2} penumbra={1} castShadow />
      <CenterLine />
      <Keys />
    </group>
  )
}

export { AbstractPiano }
