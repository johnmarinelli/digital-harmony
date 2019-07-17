import React, { useState, useRef } from 'react'
import * as THREE from 'three/src/Three'
import { useRender } from 'react-three-fiber'
import { useSpring, animated } from 'react-spring/three'
import midi from '../../util/WebMidi'
import GuiOptions from '../Gui'
import { OctahedronStates, Triggers } from '../states/scenes/Fifth'
import * as AnimationHelper from '../../util/AnimationHelper'
import clock from '../../util/Clock'

const Octahedron = ({ position = [0, 0, 0], states = OctahedronStates }) => {
  const lineVertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const [frame, setFrame] = useState(-1)
  const scaleAnimationTime = 0.5 // one-way, in seconds
  const mesh = useRef()

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
            GuiOptions.options.subjectState = frame + 1
          }
        }
      }
    },
    'FifthSceneOctahedron'
  )

  useRender(() => {
    let now = clock.getElapsedTime()
    const { options: { subjectState, subjectStateOverride } } = GuiOptions

    if (subjectStateOverride) {
      setFrame(subjectState)
      GuiOptions.syncFifthSceneOptions(octahedronProps)
    } else {
      const {
        options: { octahedronOpacity, octahedronColor, octahedronScale: scale, octahedronRotation: rotation },
      } = GuiOptions
      const { current: { material, geometry } } = mesh

      material.color.set(octahedronColor)
      material.opacity = octahedronOpacity

      mesh.current.scale.set(scale.x, scale.y, scale.z)
      mesh.current.rotation.set(
        THREE.Math.degToRad(rotation.x),
        THREE.Math.degToRad(rotation.y),
        THREE.Math.degToRad(rotation.z)
      )
    }
  })

  return (
    <animated.mesh {...octahedronProps} ref={mesh}>
      <octahedronGeometry attach="geometry" />
      <meshStandardMaterial attach="material" transparent />
    </animated.mesh>
  )
}

export default Octahedron
