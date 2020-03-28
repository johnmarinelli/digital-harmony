import React, { useState, useEffect, useRef } from 'react'
import { useSpring, useSprings, animated } from 'react-spring/three'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import midi from '../../util/WebMidi'
import clock from '../../util/Clock'
import { DEG_TO_RAD } from '../../util/Constants'
import { lerpHexColor } from '../../util/HexadecimalLerp'
import { noise } from '../../util/Noise'
import { generateHexagonGrid, HexagonGridTiles } from '../Hexagons/Hexagon'

const LongRectangle = () => {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(1.5, -1.5)
  shape.lineTo(1.2, -1.6)
  shape.lineTo(0, -0.2)

  const extrudeSettings = { amount: 0.2, bevelEnabled: false, steps: 2 }
  const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
  return geometry
}

const LongRectangle2 = () => {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(-1.5, 1.5)
  shape.lineTo(-1.2, 1.6)
  shape.lineTo(0, 0.2)

  const extrudeSettings = { depth: 0.2, bevelEnabled: false, steps: 2 }
  const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
  return geometry
}

const Snare = props => {
  const position = props.position || [0, 0, 0]
  const krGeometry = LongRectangle()
  const rect2Geometry = LongRectangle2()

  const [krSpring, setKrSpring] = useSpring(() => ({
    from: { rotation: [0, 0, 0] },
    config: { mass: 1, tension: 200, friction: 10 },
  }))

  let numTimesTriggered = 0
  const triggerFn = () => {
    numTimesTriggered++
    setKrSpring({
      rotation: [0, numTimesTriggered % 2 === 0 ? Math.PI * -1 : 0, 0],
    })
  }

  useEffect(() => {
    midi.addAbletonListener('noteon', triggerFn, 3, 'SnareListener')
  }, [])
  return (
    <group position={position}>
      <animated.mesh position={[-4, -1, 0]} rotation={krSpring.rotation} geometry={rect2Geometry}>
        <meshPhongMaterial color={0xffffff} attach="material" />
      </animated.mesh>
      <animated.mesh position={[4, 0, 0]} rotation={krSpring.rotation} geometry={krGeometry}>
        <meshPhongMaterial color={0xaaaaaa} attach="material" />
      </animated.mesh>
    </group>
  )
}

export { Snare }
