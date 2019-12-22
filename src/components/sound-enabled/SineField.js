import React from 'react'
import { extend } from 'react-three-fiber'
import * as THREE from 'three'
import { SoundWave } from './SoundWave'
import { withSong } from '../HoC/WithSong'

class SineField extends React.PureComponent {
  constructor() {
    super()
    this.groupRef = React.createRef()

    const tracks = ['battery', 'guitar']
    const soundwaves = []
    for (let i = 0; i < tracks.length; ++i) {
      const wave = (
        <SoundWave
          position={[0, i, 0]}
          waveformResolution={128}
          size={10}
          color={new THREE.Color(0xffff00)}
          opacity={1.0}
          name={tracks[i]}
        />
      )
      soundwaves.push(wave)
    }

    const Song = withSong(soundwaves, 'take_me_out', 3)
    extend({ Song })
    this.Song = <Song />
  }

  render() {
    return (
      <group position={new THREE.Vector3(-3.0, 0.0, 0.0)} ref={this.groupRef}>
        {this.Song}
      </group>
    )
  }
}

export { SineField }
