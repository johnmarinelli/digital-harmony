import React, { useState, useEffect } from 'react'
import * as THREE from 'three/src/Three'
import { useSpring, animated } from 'react-spring/three'
import { useRender } from 'react-three-fiber'
import { SquareOutlineStates } from '../states/scenes/Fifth/'
import GuiOptions from '../Gui'

const AnimatedSquareOutline = ({
  states = SquareOutlineStates,
  vertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]],
}) => {
  const [frame, setFrame] = useState(-1)
  let nextStateIndex = frame
  if (frame < states.length - 1) {
    nextStateIndex = frame + 1
  }

  const nextState = Object.assign({}, states[nextStateIndex])
  const { ...props } = useSpring(nextState)

  useRender(() => {
    if (GuiOptions.options.subjectStateOverride) {
      setFrame(GuiOptions.options.subjectState)
    }
  })

  return (
    <animated.line {...props}>
      <geometry attach="geometry" vertices={vertices.map(v => new THREE.Vector3(...v))} />
      <animated.lineBasicMaterial attach="material" />
    </animated.line>
  )
}

export default AnimatedSquareOutline
