import React, { useState, useEffect } from 'react'
import * as THREE from 'three/src/Three'
import { extend, useRender } from 'react-three-fiber'
import { useSpring, animated } from 'react-spring/three'
import * as meshline from 'three.meshline'
import midi from '../../util/WebMidi'
import GuiOptions from '../Gui'
import states from '../states/FifthScene'
import AnimatedTetrahedrons from './AnimatedTetrahedrons'
import AnimatedRing from './AnimatedRing'

extend(meshline)
const Octahedron = ({ position = [0, 0, 0] }) => {
  const lineVertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const [frame, setFrame] = useState(-1)

  let nextStateIndex = frame
  if (frame < states.length - 1) {
    nextStateIndex = frame + 1
  }

  const nextState = Object.assign(
    { octahedron: states[nextStateIndex].octahedron },
    { lines: states[nextStateIndex].lines },
    { tetrahedrons: states[nextStateIndex].tetrahedrons },
    {
      config: states[nextStateIndex].config,
    }
  )
  const nextOctahedronState = Object.assign({}, states[nextStateIndex].octahedron)
  const nextLinesState = Object.assign({}, states[nextStateIndex].lines)
  const nextTetrahedronsState = Object.assign({}, states[nextStateIndex].tetrahedrons)
  //const { octahedron, lines, tetrahedrons, config } = useSpring(nextState)
  const { ...octahedronProps } = useSpring(nextOctahedronState)
  const { ...linesProps } = useSpring(nextLinesState)
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
    <animated.group position={position}>
      <animated.line {...linesProps}>
        <geometry attach="geometry" vertices={lineVertices.map(v => new THREE.Vector3(...v))} />
        <animated.lineBasicMaterial attach="material" />
      </animated.line>
      <animated.mesh {...octahedronProps}>
        <octahedronGeometry attach="geometry" />
        <meshStandardMaterial attach="material" color="grey" transparent />
      </animated.mesh>
      <animated.group position={[-1, -1, 0]}>
        <AnimatedTetrahedrons scale={[0.5, 0.5, 0.5]} />
      </animated.group>
      <animated.group>
        <AnimatedRing scale={[1, 1, 1]} />
        <AnimatedRing
          position={[0, 0, 0.5]}
          rotation={[0, 0, THREE.Math.degToRad(Math.round(Math.random()) * 360)]}
          scale={[1.5, 1.5, 1.5]}
          ringColors={['#cbcbcb', '#ffffff', '#fbfbfb', '#a0a0a0', '#727171']}
        />
        <AnimatedRing
          position={[0, 0, 1]}
          rotation={[0, 0, THREE.Math.degToRad(Math.round(Math.random()) * 360)]}
          scale={[2, 2, 2]}
          ringColors={['#a3a3a3', '#f2f2f2', '#c9c9c9', '#808080', '#5c5b5b']}
        />
      </animated.group>
    </animated.group>
  )
}

export { states }
export default Octahedron
