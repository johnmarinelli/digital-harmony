import React, { useState, useEffect } from 'react'
import * as THREE from 'three/src/Three'
import { extend, useRender } from 'react-three-fiber'
import { useSprings, useSpring, animated } from 'react-spring/three'
import * as meshline from 'three.meshline'
import midi from '../../util/WebMidi'
import GuiOptions from '../Gui'
import states from '../states/FifthScene'

const colors = ['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff']

const random = () => {
  const rand = Math.random()
  return {
    color: colors[Math.round(Math.random() * (colors.length - 1))],
    scale: [0.5, 0.5, 0.5],
    rotation: [0, 0, THREE.Math.degToRad(Math.round(Math.random()) * 45)],
  }
}

const AnimatedTetrahedrons = ({ number = 1 }) => {
  const [springs, set] = useSprings(number, i => ({
    from: random(),
    ...random(),
    config: { mass: 20, tension: 500, friction: 200 },
  }))
  useEffect(() => void setInterval(() => set(i => ({ ...random(), delay: i * 50 })), 1000), [])
  return springs.map(({ color, scale, position }, index) => (
    <animated.mesh key={index} scale={scale}>
      <tetrahedronGeometry attach="geometry" />
      <meshPhongMaterial attach="material" color={color} />
    </animated.mesh>
  ))
}

extend(meshline)
const Octahedron = ({ position = [0, 0, 0] }) => {
  const lineVertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const [frame, setFrame] = useState(-1)

  let nextStateIndex = frame
  if (frame < states.length - 1) {
    nextStateIndex = frame + 1
  }
  const nextState = Object.assign(
    { config: states[frame + 1].config },
    states[nextStateIndex].octahedron,
    states[nextStateIndex].lines,
    states[nextStateIndex].tetrahedrons,
    {
      config: states[nextStateIndex].config,
    }
  )
  const {
    octahedronPosition,
    color,
    linePosition,
    tetrahedronsOpacity,
    tetrahedronsRotation,
    tetrahedronsScale,
    ...props
  } = useSpring(nextState)

  midi.addListener(
    'noteon',
    note => {
      console.log(note)
      const numLastNotes = midi.lastNotes.length
      const trigger = states[frame + 1].trigger
      if (trigger) {
        const lastNotesMatch =
          JSON.stringify(midi.lastNotes.slice(numLastNotes - trigger.length)) === JSON.stringify(trigger)
        if (lastNotesMatch) {
          if (frame < states.length - 1) {
            setFrame(frame + 1)
          }
        }
      }
    },
    'FifthSceneOctahedron'
  )

  useRender(() => {
    if (GuiOptions.options.subjectStateOverride) {
      setFrame(GuiOptions.options.subjectState)
    }
  })

  let tetrahedrons = []
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      tetrahedrons.push(
        <animated.mesh
          key={i * 3 + j}
          position={[j, i, 0]}
          scale={tetrahedronsScale}
          rotation={tetrahedronsRotation}
          material-opacity={tetrahedronsOpacity}
        >
          <tetrahedronGeometry attach="geometry" />
          <meshStandardMaterial attach="material" color="red" transparent />
        </animated.mesh>
      )
    }
  }

  return (
    <animated.group position={position}>
      <animated.line position={linePosition}>
        <geometry attach="geometry" vertices={lineVertices.map(v => new THREE.Vector3(...v))} />
        <animated.lineBasicMaterial attach="material" color={color} />
      </animated.line>
      <animated.mesh {...props} position={octahedronPosition}>
        <octahedronGeometry attach="geometry" />
        <meshStandardMaterial attach="material" color="grey" transparent />
      </animated.mesh>
      <animated.group position={[-1, -1, 0]}>
        <AnimatedTetrahedrons />
      </animated.group>
    </animated.group>
  )
}

export { states }
export default Octahedron
