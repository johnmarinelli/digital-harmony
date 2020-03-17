import React, { useRef } from 'react'
import { useSpring, useSprings, animated } from 'react-spring/three'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import midi from '../../util/WebMidi'
import clock from '../../util/Clock'
import { DEG_TO_RAD } from '../../util/Constants'
import { lerpHexColor } from '../../util/HexadecimalLerp'
import { noise } from '../../util/Noise'
import { generateHexagonGrid, HexagonGridTiles } from '../Hexagons/Hexagon'
import { bass } from '../signal-generators/bass'

const Bass = props => {
  const parentRef = useRef()
  const dimensions = [50, 5]
  const cells = generateHexagonGrid({ dimensions })
  const tiles = HexagonGridTiles(cells, {})

  const { signal, triggerFn } = bass()
  const width = tiles.length
  let yCoord = 0,
    bassValue = 0,
    phase = 0,
    waveformData = new Array(width).fill(0)

  const [springs, set] = useSprings(tiles.length, i => ({
    from: {
      translateY: 0,
    },
    translateY: -1,
    config: { mass: 20, tension: 500, friction: 170 },
  }))

  const beginColor = 0x111111
  const endColor = 0xeeeeee

  const render = () => {
    for (let i = 0; i < width; ++i) {
      bassValue = signal.value
      yCoord = Math.sin(i / 60 + phase) * bassValue * 5
      waveformData[i] = yCoord
    }
    //increasing phase means that the kick wave will
    //not be standing and looks more dynamic
    phase++
    const parent = parentRef.current
    const children = parent.children
    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      child.position.y = waveformData[i]
    }
  }

  useRender(render)
  midi.addAbletonListener('noteon', triggerFn, 2, 'BassListener')
  return (
    <group position={[0, -2, 1]} scale={[0.1, 0.1, 0.1]} ref={parentRef}>
      {tiles.map((tile, i) => {
        const { worldPosition: position } = tile
        return (
          <mesh
            rotation={[Math.PI * 0.5, 0, 0]}
            position={position}
            geometry={tile.geometry}
            scale={[0.5, 0.5, 0.7]}
            key={i}
          >
            <meshPhongMaterial color={lerpHexColor(beginColor, endColor, i / tiles.length)} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

export { Bass }
