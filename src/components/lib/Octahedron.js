import React, { useState, useEffect } from 'react'
import * as THREE from 'three/src/Three'
import { useRender } from 'react-three-fiber'
import { useSpring, animated } from 'react-spring/three'
import midi from '../../util/WebMidi'
import GuiOptions from '../Gui'
import { OctahedronStates, Triggers } from '../states/scenes/Fifth'

const Octahedron = ({ position = [0, 0, 0], states = OctahedronStates }) => {
  const lineVertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const [frame, setFrame] = useState(-1)

  let nextStateIndex = frame
  if (frame < states.length - 1) {
    nextStateIndex = frame + 1
  }

  const nextOctahedronState = Object.assign({}, states[nextStateIndex])
  const { ...octahedronProps } = useSpring(nextOctahedronState)

  midi.addListener(
    'noteon',
    note => {
      const numLastNotes = midi.lastNotes.length
      const trigger = Triggers[frame + 1]
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

  const {
    options: {
      subjectStateOverride,
      octahedronOpacity,
      octahedronColor,
      octahedronScale: scale,
      octahedronRotation: rotation,
    },
  } = GuiOptions

  const newProps = subjectStateOverride
    ? Object.assign({}, octahedronProps, {
        'material-opacity': octahedronOpacity,
        'material-color': octahedronColor,
        scale,
        rotation,
      })
    : octahedronProps

  console.log(newProps)

  return (
    <animated.mesh {...newProps}>
      <octahedronGeometry attach="geometry" />
      <meshStandardMaterial attach="material" color="grey" transparent />
    </animated.mesh>
  )
}

export default Octahedron
