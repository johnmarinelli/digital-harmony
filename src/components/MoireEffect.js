import React, { useRef, useEffect } from 'react'
import Tone from 'tone'
import { useRender } from 'react-three-fiber'

class SynthManager {
  constructor() {
    this.instance = null

    this.synths = [
      new Tone.Synth({
        oscillator: {
          type: 'triangle8',
        },
        envelope: {
          attack: 2,
          decay: 1,
          sustain: 0.4,
          release: 4,
        },
      }).toMaster(),

      new Tone.Synth({
        oscillator: {
          type: 'triangle8',
        },
        envelope: {
          attack: 2,
          decay: 1,
          sustain: 0.4,
          release: 4,
        },
      }).toMaster(),
    ]
  }

  dispose() {
    this.synths.forEach(synth => synth.dispose())
  }
}

const synthManager = new SynthManager()

const MoireEffect = props => {
  const totalTimeInSeconds = props.totalTimeInSeconds
  const gridA = useRef()
  const gridB = useRef()
  const gridC = useRef()

  let startTime = null

  const [synthA, synthB] = synthManager.synths

  useEffect(() => {
    startTime = synthB.now()

    //synthB.triggerAttack('C3')
    //synthB.frequency.setValueAtTime('C3', startTime + 10)
    // ramp to e3
    synthB.frequency.linearRampToValueAtTime('E3', startTime + 15)
    synthB.frequency.linearRampToValueAtTime('G3', startTime + 25)
    synthB.triggerRelease(startTime + 30)

    //synthA.triggerAttackRelease('B3', '30s')
  })

  const MAGIC_NUMBER = 0.00005
  const RANDOM_CONSTANT = Math.random() * MAGIC_NUMBER * 5

  useRender(() => {
    const { current: gridAHdl } = gridA
    const { current: gridBHdl } = gridB
    const { current: gridCHdl } = gridC
    const freq = synthB.frequency.input.value
    const freqScaled = freq * MAGIC_NUMBER

    const aDy = gridAHdl.rotation.y + freqScaled
    const bDy = gridBHdl.rotation.y + freqScaled

    gridAHdl.rotation.y = aDy
    gridBHdl.rotation.y = bDy - RANDOM_CONSTANT - RANDOM_CONSTANT
    gridCHdl.rotation.y = aDy + RANDOM_CONSTANT
  })

  return (
    <group rotation-x={Math.PI * 0.5}>
      <gridHelper position-y={-0.1} ref={gridA} args={[6, 100, 0xff0077]} />
      <gridHelper position-y={-0.2} ref={gridB} args={[6, 100, 0x00eeff]} />
      <gridHelper position-y={-0.3} ref={gridC} args={[6, 100]} />
    </group>
  )
}

export { MoireEffect }
