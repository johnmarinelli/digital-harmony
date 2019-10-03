import React from 'react'
import * as THREE from 'three'
import Player from '../../sound-player/Player'
import events from 'events'
import { Transport } from 'tone'

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
        })
      )
      return newComponents
    }
  }
}
export { withSong }
