import React, { useRef } from 'react'
import { extend, useRender } from 'react-three-fiber'
import * as THREE from 'three'
import { Transport } from 'tone'
import clock from '../../util/Clock'
import { withSong } from '../HoC/WithSong'

import { ShadowEnabledBox, StripedLight } from '../FloatingSphereLights'

const SoundEnabledStripedLight = props => {
  const { player, waveformResolution } = props
  const threshold = 0.0001
  let waveform = new Float32Array(waveformResolution)

  const soundReactionFn = ref => {
    if (player && Transport.state === 'started') {
      player.getWaveform(waveform)
      let avg =
        waveform.reduce((acc, val) => {
          acc += Math.abs(val)
          return acc
        }, 0) / waveform.length

      if (avg > threshold) {
        let scaleVal = 1.0 + avg
        ref.current.scale.set(scaleVal, scaleVal, scaleVal)
      } else {
        ref.current.scale.set(1, 1, 1)
      }
      // set scale according to waveform here
    }
  }

  return <StripedLight {...props} soundReactionFn={soundReactionFn} />
}

class FloatingSphereLights extends React.PureComponent {
  constructor(props) {
    super(props)
    this.positionFn = props.positionFn
    this.positionFn = this.positionFn
      ? this.positionFn
      : time => ({
          x: Math.sin(time * 0.6) * 0.9,
          y: Math.sin(time * 0.7) * 0.9 + 0.6,
          z: Math.sin(time * 0.8) * 0.9,
        })
    const components = [
      <SoundEnabledStripedLight
        name="snare0"
        waveformResolution={16}
        color={0xff0000}
        positionFn={this.positionFn}
        timeOffset={0}
      />,
    ]

    const Song = withSong(components, 'grandfather_story', 3)
    extend({ Song })
    this.Song = <Song />
  }

  render() {
    const { boxDimensions, boxYPosition } = this.props
    return (
      <group>
        {this.Song}
        <StripedLight color={0x0000ff} positionFn={this.positionFn} timeOffset={100} />
        <ShadowEnabledBox boxDimensions={boxDimensions} yPosition={boxYPosition} />
      </group>
    )
  }
}

export { FloatingSphereLights }
