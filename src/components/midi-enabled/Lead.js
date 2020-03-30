import React, { useRef } from 'react'
import { useSpring, useSprings, animated } from 'react-spring/three'
import { useRender } from 'react-three-fiber'
import midi from '../../util/WebMidi'
import { Flocking } from '../Flocking'
import GuiOptions from '../Gui'

const Lead = props => {
  const position = props.position || [0, 0, 0]

  const controlChangeFn = e => {
    const pct = e.value / 127
    GuiOptions.options.flockingCenteringFactor = 1 + 20 * pct
  }

  midi.addAbletonListener('controlchange', controlChangeFn, 4, 'LeadCCListener')

  return <Flocking rotateX={Math.PI * 0.5} position={position} scale={[0.3, 0.3, 0.3]} />
}

export { Lead }
