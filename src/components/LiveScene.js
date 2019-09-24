import React, { useRef } from 'react'
import { extend, useRender } from 'react-three-fiber'
import * as THREE from 'three'
import Background from './Background'
import Player from '../sound-player/Player'
import events from 'events'
import { Transport } from 'tone'
import { Rings } from './sound-enabled/Rings'

/*
 * HoC that represents a full song.
 * Handles audio player -> component mapping,
 * and starting the player
 */
function withSong(Components, folder, segments, position = new THREE.Vector3(0, 0, 0)) {
  return class extends React.Component {
    constructor() {
      super()
      this.audioFileStatusEmitter = new events.EventEmitter()
      this.players = []
      const trackNames = Components.map(component => component.props.name)
      const numTracks = Components.length

      for (let i = 0; i < numTracks; ++i) {
        this.players.push(
          new Player({ position, name: trackNames[i], folder, segments, eventEmitterRef: this.audioFileStatusEmitter })
        )
        this.audioFileStatusEmitter.on('player-ready', () => {
          const allTracksReady = this.players
            .map(player => {
              return player.isLoaded()
            })
            .reduce((b, acc) => acc && b, true)

          if (allTracksReady) {
            this.players.forEach(player => player.onSongStart())

            if (Transport.state !== 'started') {
              Transport.start()
            }
          }
        })
      }
    }

    // dtor
    componentWillUnmount() {
      this.players.forEach(player => player.destroy())
      console.log('componentWillUnmount')
    }

    shouldComponentUpdate() {
      console.log('shouldComponentUpdate', arguments)
    }

    getSnapshotBeforeUpdate() {
      console.log('getSnapshotBeforeUpdate', arguments)
    }

    componentDidUpdate() {
      console.log('componentDidUpdate', arguments)
    }

    render() {
      console.log('render')
      const newComponents = Components.map((component, i) =>
        React.cloneElement(component, {
          folder,
          segments,
          player: this.players.filter(player => player.name === component.props.name)[0],
          key: i,
          position: new THREE.Vector3(i * 3, 0, 0),
        })
      )
      return newComponents
    }
  }
}

class LiveScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const ringComponents = [
      <Rings amplitude={1} name="battery" />,
      <Rings amplitude={1.4} name="vocals" baseColor={0x000000} />,
    ]

    const Song = withSong(ringComponents, 'take_me_out', 3)
    extend({ Song })
    const { top, size } = this.props
    const scrollMax = size.height * 4.5
    return (
      <scene ref={this.sceneRef}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <Song />
      </scene>
    )
  }
}
export default LiveScene
