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
function withSong(Components, folder, numSegments, position = new THREE.Vector3(0, 0, 0)) {
  return class extends React.PureComponent {
    constructor() {
      super()
      this.audioFileStatusEmitter = new events.EventEmitter()
      this.players = []
      const trackNames = Components.map(component => component.props.name)
      const numTracks = Components.length

      for (let i = 0; i < numTracks; ++i) {
        this.players.push(
          new Player({
            position,
            name: trackNames[i],
            folder,
            segments: numSegments,
            eventEmitterRef: this.audioFileStatusEmitter,
          })
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

      this.clonedComponents = Components.map((component, i) => {
        return React.cloneElement(component, {
          folder,
          segments: numSegments,
          player: this.players.filter(player => player.name === component.props.name)[0],
          key: i,
        })
      })
    }

    componentDidMount() {
      console.log('WithSong::componentDidMount')
    }

    // dtor
    componentWillUnmount() {
      this.players.forEach(player => player.destroy())
      console.log('WithSong::componentWillUnmount')
    }

    getSnapshotBeforeUpdate() {
      console.log('WithSong::getSnapshotBeforeUpdate', arguments)
    }

    componentDidUpdate() {
      console.log('WithSong::componentDidUpdate', arguments)
    }

    render() {
      console.log('WithSong::render')
      return this.clonedComponents
    }
  }
}
export { withSong }
