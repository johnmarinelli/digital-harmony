import React, { useState } from 'react'
import * as THREE from 'three/src/Three'
import { extend, useRender } from 'react-three-fiber'
import { useSpring, animated } from 'react-spring/three'
import * as meshline from 'three.meshline'
import midi from '../../util/WebMidi'
import GuiOptions from '../Gui'

extend(meshline)

const states = [
  // m1b0.5
  {
    trigger: [64, 67, 71],
    octahedron: {
      'material-opacity': 0.25,
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    },
    lines: {
      color: 'white',
      linePosition: [0, 0, 0],
    },
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 },
  },

  // m1b2
  {
    trigger: [76, 71],
    octahedron: {
      'material-opacity': 0.55,
      scale: [1.1, 1.1, 1.1],
      rotation: [THREE.Math.degToRad(30), 0, THREE.Math.degToRad(20)],
    },
    lines: {
      linePosition: [0, 0, 0.2],
    },
  },

  // m2b2
  {
    trigger: [63, 71, 67],
    octahedron: {
      scale: [1.3, 1.3, 1.4],
    },
    lines: {
      linePosition: [0, 0, 0.25],
    },
  },

  {
    octahedron: {
      'material-opacity': 0.25,
      scale: [1.3, 1.3, 1.3],
      rotation: [THREE.Math.degToRad(30), 0, THREE.Math.degToRad(30)],
    },
    lines: {
      color: 'blue',
      linePosition: [0, 0, 0.2],
    },
  },
  {
    octahedron: {
      'material-opacity': 0.6,
      scale: [1.5, 1.5, 1.5],
      rotation: [THREE.Math.degToRad(180), 0, THREE.Math.degToRad(45)],
    },
    lines: {
      color: 'hotpink',
      linePosition: [0, 0, 2],
    },
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 },
  },
  {
    octahedron: {
      'material-opacity': 0.9,
      scale: [2, 2, 2],
      rotation: [THREE.Math.degToRad(360), 0, THREE.Math.degToRad(90)],
    },
    lines: {
      color: 'green',
      linePosition: [0, 0, 1],
    },
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 },
  },
]

const Octahedron = ({ position = [0, 0, 0] }) => {
  const lineVertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const [octahedronState, setOctahedronState] = useState(-1)
  const [lineState, setLineState] = useState(-1)

  let nextStateIndex = octahedronState
  if (octahedronState < states.length - 1) {
    nextStateIndex = octahedronState + 1
  }
  const nextState = Object.assign(
    { config: states[octahedronState + 1].config },
    states[nextStateIndex].octahedron,
    states[nextStateIndex].lines,
    {
      config: states[nextStateIndex].config,
    }
  )
  const { color, linePosition, ...props } = useSpring(nextState)

  midi.addListener(
    'noteon',
    note => {
      console.log(note)
      const numLastNotes = midi.lastNotes.length
      const trigger = states[octahedronState + 1].trigger
      if (trigger) {
        const lastNotesMatch =
          JSON.stringify(midi.lastNotes.slice(numLastNotes - trigger.length)) === JSON.stringify(trigger)
        if (lastNotesMatch) {
          if (octahedronState < states.length - 1) {
            setOctahedronState(octahedronState + 1)
          }
          if (lineState < states.length - 1) {
            setLineState(lineState + 1)
          }
        }
      }
    },
    'FifthSceneOctahedron'
  )

  useRender(() => {
    if (GuiOptions.options.subjectStateOverride) {
      setOctahedronState(GuiOptions.options.subjectState)
      setLineState(GuiOptions.options.subjectState)
    }
  })

  return (
    <animated.group position={position}>
      <animated.line position={linePosition}>
        <geometry attach="geometry" vertices={lineVertices.map(v => new THREE.Vector3(...v))} />
        <animated.lineBasicMaterial attach="material" color={color} />
      </animated.line>
      <animated.mesh {...props}>
        <octahedronGeometry attach="geometry" />
        <meshStandardMaterial attach="material" color="grey" transparent />
      </animated.mesh>
    </animated.group>
  )
}

export { states }
export default Octahedron
