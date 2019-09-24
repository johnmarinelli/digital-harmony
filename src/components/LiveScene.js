import React, { useRef } from 'react'
import { extend, useRender } from 'react-three-fiber'
import * as THREE from 'three'
import Background from './Background'
import clock from '../util/Clock'
import Player from '../sound-player/Player'
import events from 'events'
import { Transport } from 'tone'
import { RingPoints } from './sound-enabled/RingPoints'
const ease = t =>
  t === 0.0 || t === 1.0
    ? t
    : t < 0.5 ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0) : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0

const Rings = ({ position = new THREE.Vector3(0, 0, 0), folder, segments, player, amplitude }) => {
  const rings = []
  const components = []
  const numRings = 96
  const numWaveforms = 128

  for (let i = 0; i < numRings; ++i) {
    const ring = new RingPoints({
      radius: i * 0.05 + 0.5,
      resolution: 120,
      color: new THREE.Color(0x00ff00).setHSL(i / numRings, 1, 0.75),
      opacity: Math.min(1, THREE.Math.mapLinear(numRings - i, numRings, 1, 4.0, 0.3)),
      blending: THREE.NormalBlending,
      shape: 'circle',
      size: 38,
      amplitude,
    })
    ring.rotateX(Math.PI * 0.25)
    rings.push(ring)
  }

  let waveforms = []
  for (let i = 0; i < numRings; ++i) {
    waveforms.push(new Float32Array(numWaveforms))
  }

  let elapsed = 0,
    amp = 0
  const render = () => {
    elapsed = clock.getElapsedTime()

    if (player && Transport.state === 'started') {
      const t = THREE.Math.clamp((1000 * elapsed - 500) / 8000, 0, 1)
      const nextAmp = player.getAmplitude()
      amp = Math.max(nextAmp, amp + (nextAmp - amp) * 0.1)
      const wf = waveforms.pop()
      player.getWaveform(wf)
      waveforms.unshift(wf)

      if (player && player.isLoaded()) {
        const parent = parentRef.current
        const children = parent.children
        for (let i = 0; i < children.length; ++i) {
          const child = children[i]
          child.material.uniforms.waveform.value = waveforms[i]
          child.transitionStep(ease(t))

          //const diff = (goal - rings[0].rotation.x) * ramp(elapsed, 10000)
          //child.rotation.x += diff
        }
      }
    }
  }

  useRender(render)

  for (let i = 0; i < numRings; ++i) {
    const ring = rings[i]
    components.push(<primitive object={ring} key={i} />)
  }
  const parentRef = useRef()
  return (
    <group position={position} ref={parentRef}>
      {components}
    </group>
  )
}

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
    const ringComponents = [<Rings amplitude={1} name="battery" />, <Rings amplitude={2} name="vocals" />]

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
