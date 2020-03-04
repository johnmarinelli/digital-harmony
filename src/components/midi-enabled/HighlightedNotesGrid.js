import React from 'react'
import * as THREE from 'three'
import midi from '../../util/WebMidi'
import { useSprings, animated } from 'react-spring/three'

const HighlightedNotesGrid = props => {
  const width = 5,
    height = 9
  const points = []
  const startNote = 35
  const midpointBetweenHands = 60

  let index = 0
  for (let i = 0; i < width; ++i) {
    for (let j = 0; j < height; ++j) {
      let x = i * 0.5 - 3
      let y = j * 0.5 - 2.5
      let z = 0

      if (index % 2 !== 0) {
        x += 3
        y += 0.5
      }
      points.push([x, y, z])
    }
    index++
  }
  const [springs, setSprings] = useSprings(points.length, i => {
    const position = points[i]
    return {
      from: { position },
      config: { mass: 100, tension: 10000, friction: 1000 },
    }
  })

  const sphereGeometry = new THREE.SphereBufferGeometry(0.05, 10, 10)
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('white'),
    transparent: true,
    opacity: 0.5,
    wireframe: true,
  })

  midi.addListener(
    'noteon',
    note => {
      const position = points[note.number - startNote]
      console.log(note.number)
      setSprings(i => {
        if (i === note.number - startNote) {
          return { position: [position[0], position[1], position[2] + 2] }
        }
      })
    },
    'HighlightedNotesGrid'
  )

  midi.addListener(
    'noteoff',
    note => {
      const position = points[note.number - startNote]
      setSprings(i => {
        if (i === note.number - startNote) {
          return { position }
        }
      })
    },
    'HighlightedNotesGrid'
  )

  return springs.map(({ position }, index) => {
    return <animated.mesh position={position} key={index} material={material} geometry={sphereGeometry} />
  })
}

export { HighlightedNotesGrid }
