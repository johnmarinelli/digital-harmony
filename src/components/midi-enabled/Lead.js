import React, { useRef } from 'react'
import { useSpring, useSprings, animated } from 'react-spring/three'
import { useRender } from 'react-three-fiber'
import midi from '../../util/WebMidi'
import { Flocking } from '../Flocking'

const Lead = props => {
  const triggerFn = e => {
    console.log(e)
  }

  const controlChangeFn = e => {
    console.log(e)
  }

  midi.addAbletonListener('noteon', triggerFn, 4, 'LeadListener')
  midi.addAbletonListener('controlchange', controlChangeFn, 4, 'LeadListener')

  return <Flocking scale={[0.3, 0.3, 0.3]} />
}

export { Lead }
