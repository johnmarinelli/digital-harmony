import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import midi from '../../util/WebMidi'
import clock from '../../util/Clock'
import { noise } from '../../util/Noise'
import { useSpring, useSprings, animated } from 'react-spring/three'
import { FlippantHexagonGrid } from '../Hexagons/Hexagon'

const Bass = props => {
  return <FlippantHexagonGrid position={[0, -3, 0.5]} rotation={[Math.PI * 0.5, 0, 0]} />
}

export { Bass }
