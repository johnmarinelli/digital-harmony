import React, { useState, useEffect } from 'react'
import * as THREE from 'three/src/Three'
import { extend, useRender } from 'react-three-fiber'
import { useSpring, animated } from 'react-spring/three'
import * as meshline from 'three.meshline'
import midi from '../../util/WebMidi'
import GuiOptions from '../Gui'
import states from '../states/FifthScene'
import { OctahedronStates } from '../states/FifthScene'

extend(meshline)
const Octahedron = ({ position = [0, 0, 0] }) => {
  const lineVertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const [frame, setFrame] = useState(-1)

  let nextStateIndex = frame
  if (frame < states.length - 1) {
    nextStateIndex = frame + 1
  }

  const nextOctahedronState = Object.assign({}, OctahedronStates[nextStateIndex])
  const nextTetrahedronsState = Object.assign({}, states[nextStateIndex].tetrahedrons)
  const { ...octahedronProps } = useSpring(nextOctahedronState)
  const { ...tetrahedronsProps } = useSpring(nextTetrahedronsState)

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

  let meshes = []
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      meshes.push(
        <animated.mesh key={i * 3 + j} {...tetrahedronsProps} position={[j, i, 0]}>
          <tetrahedronGeometry attach="geometry" />
          <meshStandardMaterial attach="material" color="red" transparent />
        </animated.mesh>
      )
    }
  }

  return (
    <animated.mesh {...octahedronProps}>
      <octahedronGeometry attach="geometry" />
      <meshStandardMaterial attach="material" color="grey" transparent />
    </animated.mesh>
  )
}

export { states }
export default Octahedron
