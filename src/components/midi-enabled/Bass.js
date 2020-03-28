import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import midi from '../../util/WebMidi'
import { lerpHexColor } from '../../util/HexadecimalLerp'
import { generateHexagonGrid, HexagonGridTiles } from '../Hexagons/Hexagon'
import { bass } from '../signal-generators/bass'

const Bass = props => {
  const position = props.position || [0, 0, 0]
  const parentRef = useRef()
  const dimensions = [50, 50]
  const cells = generateHexagonGrid({ dimensions })
  const tiles = HexagonGridTiles(cells, {})

  const { signal, triggerFn } = bass()
  const width = tiles.length
  let yCoord = 0,
    bassValue = 0,
    phase = 0,
    waveformData = new Array(width).fill(0)

  const beginColor = 0x333333
  const endColor = 0x999999

  const render = () => {
    for (let i = 0; i < width; ++i) {
      bassValue = signal.value
      yCoord = Math.sin(i / 60 + phase) * bassValue * 5
      waveformData[i] = yCoord
    }
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
    <group position={position} rotation={[0, 0, 0]} scale={[0.5, 0.5, 0.5]} ref={parentRef}>
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
