import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import Background from './Background'
import { VertexShader, FragmentShader } from '../shaders/LiveSceneShader'
import clock from '../util/Clock'
import Player from '../sound-player/Player'
import events from 'events'
import { Transport } from 'tone'

class RingPointMaterial extends THREE.RawShaderMaterial {
  constructor(
    options = {
      amplitude: 1.2,
      opacity: 1,
      size: 1,
      blending: THREE.NormalBlending,
      shape: 'circle',
      radius: 1.0,
      color: new THREE.Color(0xff00ff),
      resolution: 128,
    }
  ) {
    const { amplitude, opacity, size, blending, shape, radius, resolution, color } = options

    const waveform = new Float32Array(resolution)
    for (let i = 0; i < resolution; i++) {
      waveform[i] = 0
    }
    super({
      fog: true,
      blending,
      defines: {
        WAVEFORM_RESOLUTION: resolution,
      },
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      transparent: true,
      uniforms: {
        shape: {
          type: 't',
          value: new THREE.TextureLoader().load(`/textures/${shape}.png`),
        },
        radius: {
          type: 'f',
          value: radius,
        },
        size: {
          type: 'f',
          value: size,
        },
        color: {
          type: 'c',
          value: color,
        },
        opacity: {
          type: 'f',
          value: opacity,
        },
        waveform: {
          type: 'fv1',
          value: waveform,
        },
        amplitude: {
          type: 'f',
          value: amplitude,
        },
        fogNear: {
          type: 'f',
          value: 0,
        },
        fogFar: {
          type: 'f',
          value: 0,
        },
        fogColor: {
          type: 'c',
          value: new THREE.Color(),
        },
      },
    })
  }
}

class RingBufferGeometry extends THREE.BufferGeometry {
  constructor(options = { resolution: 128 }) {
    super(new THREE.BufferGeometry())

    const { resolution } = options

    //position attribute, needs to be there,
    //but its calculated in the vertex shader
    const positions = new Float32Array(resolution * 3)
    const posAttribute = new THREE.BufferAttribute(positions, 3)
    this.addAttribute('position', posAttribute)

    //index attribute, each point gets an index for reference on the waveform uniform
    const reference = new Float32Array(resolution)
    for (let i = 0; i < resolution; i++) {
      reference[i] = i / resolution
    }

    const referenceAttribute = new THREE.BufferAttribute(reference, 1)
    this.addAttribute('reference', referenceAttribute)

    // since the positions are set in shader,
    // we need a custom boundingSphere to a void erroneous culling
    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0.52)
  }
}

const ease = t =>
  t === 0.0 || t === 1.0
    ? t
    : t < 0.5 ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0) : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0

/**
 * RingPoints
 * the `Object3D` for a single circle of particles
 * @extends THREE.Points
 * @see RingPointMaterial
 * @param {Object} [options] check `RingPointMaterial` for properties
 */
class RingPoints extends THREE.Points {
  constructor(options) {
    const geom = new RingBufferGeometry({ resolution: options.resolution })

    super(geom, new RingPointMaterial(options))

    this.renderOrder = 2

    this.__goalProperties = {
      radius: this.material.uniforms.radius.value,
      opacity: this.material.uniforms.opacity.value,
    }
  }

  transitionStep(t) {
    for (let prop in this.__goalProperties) {
      // beginning fade-in movement
      const uni = this.material.uniforms[prop]
      uni.value = THREE.Math.lerp(0, this.__goalProperties[prop], t)
    }
  }
}

const Rings = ({ position = new THREE.Vector3(0, 0, 0), folder, segments, trackNames }) => {
  const audioFileStatusEmitter = new events.EventEmitter()
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
      amplitude: 1.2,
    })
    ring.rotateX(Math.PI * 0.25)
    rings.push(ring)
  }

  let waveforms = []
  for (let i = 0; i < numRings; ++i) {
    waveforms.push(new Float32Array(numWaveforms))
  }

  const ramp = (elapsed, duration, minOut = 0, maxOut = 0.005) =>
    THREE.Math.clamp(THREE.Math.mapLinear(elapsed, 0, duration, minOut, maxOut), minOut, maxOut)
  const numTracks = trackNames.length
  const players = []

  for (let i = 0; i < numTracks; ++i) {
    players.push(
      new Player({ position, name: trackNames[i], folder, segments, eventEmitterRef: audioFileStatusEmitter })
    )
  }

  audioFileStatusEmitter.on('player-ready', () => {
    const allTracksReady = players.map(player => player.isLoaded()).reduce((b, acc) => acc && b, true)
    if (allTracksReady) {
      players.forEach(player => player.onSongStart())
      if (Transport.state !== 'started') {
        Transport.start()
      }
    }
  })

  let elapsed = 0,
    amplitude = 0
  const render = () => {
    elapsed = clock.getElapsedTime()

    const allTracksReady = players.map(player => player.isLoaded()).reduce((b, acc) => acc && b, true)
    if (allTracksReady && Transport.state === 'started') {
      const t = THREE.Math.clamp((1000 * elapsed - 500) / 8000, 0, 1)
      const player = players[2]
      const nextAmp = player.getAmplitude()
      amplitude = Math.max(nextAmp, amplitude + (nextAmp - amplitude) * 0.1)
      const wf = waveforms.pop()
      player.getWaveform(wf)
      waveforms.unshift(wf)

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

  useRender(render)

  for (let i = 0; i < numRings; ++i) {
    const ring = rings[i]
    components.push(<primitive object={ring} key={i} />)
  }
  const parentRef = useRef()
  return <group ref={parentRef}>{components}</group>
}

class LiveScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
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
        <Rings folder="take_me_out" segments={3} trackNames={['battery', 'guitar', 'vocals']} />
      </scene>
    )
  }
}
export default LiveScene
