import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import midi from '../../util/WebMidi'
import clock from '../../util/Clock'
import { noise } from '../../util/Noise'
import { useSpring, useSprings, animated } from 'react-spring/three'
import { hihat } from '../signal-generators/hihat'
import { GlitchRepeater } from '../GlitchRepeater'

const HiHat = props => {
  const signalBandwidth = props.signalBandwidth || 16
  const { signal, triggerFn } = hihat()
  midi.addAbletonListener('noteon', triggerFn, 1, 'HiHatListener')

  let yCoord = 0,
    phase = 0,
    hihatWaveformData = new Array(signalBandwidth).fill(0),
    hihatValue = 0

  const renderHook = group => {
    const { children } = group
    hihatValue = signal.envelope.value
    let child = null

    for (let i = 0; i < signalBandwidth; ++i) {
      yCoord = Math.sin(i / 60 + phase) * hihatValue
      hihatWaveformData[i] = yCoord
    }
    for (let i = children.length - 1; i >= 0; --i) {
      child = children[i]
      child.material.opacity = hihatWaveformData[signalBandwidth - i] * 10
    }
  }

  return (
    <GlitchRepeater
      position={new THREE.Vector3(-2.0, 2.5, 1.0)}
      mesh={new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0xfefefe }))}
      updateFn={t => {
        const xSpan = 6
        const xStart = -2
        const p = (t % xSpan) / xSpan
        const x = THREE.Math.lerp(xStart, xStart + xSpan, p)
        const y = noise(t + 1, t)

        return [x, y, 0]
      }}
      extraRenderFunction={renderHook}
      numRepeats={signalBandwidth}
    />
  )
}

export { HiHat }
