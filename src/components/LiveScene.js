import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import throttle from 'lodash.throttle'
import Background from './Background'
import { VertexShader, FragmentShader } from '../shaders/LiveSceneShader'
import Tone from 'tone'
import clock from '../util/Clock'

const loadAudio = baseFilename => {
  return new Promise(resolve => {
    const path = `/audio/reference/split/${baseFilename}-0.mp3`
    new Tone.Buffer(path, buffer => {
      resolve(buffer.getChannelData(0))
    })
  })
}

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

const ease = {
  expoInOut: t =>
    t === 0.0 || t === 1.0
      ? t
      : t < 0.5 ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0) : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0,
}

const Rings = () => {
  const rings = []
  const components = []
  const numRings = 96
  const numWaveforms = 128

  for (let i = 0; i < numRings; ++i) {
    const material = new RingPointMaterial({
      radius: i * 0.05 + 0.5,
      resolution: 120,
      color: new THREE.Color(0x00ff00).setHSL(i / numRings, 1, 0.75),
      opacity: Math.min(1, THREE.Math.mapLinear(numRings - i, numRings, 1, 4.0, 0.3)),
      blending: THREE.NormalBlending,
      shape: 'circle',
      size: 38,
      amplitude: 1.2,
    })
    const geometry = new RingBufferGeometry({ resolution: 120 })
    const ring = new THREE.Points(geometry, material)
    ring.renderOrder = 2
    ring.goalProperties = { radius: material.uniforms.radius.value, opacity: material.uniforms.opacity.value }
    ring.rotateX(Math.PI * 0.25)
    rings.push(ring)
  }

  let waveforms = []
  for (let i = 0; i < numRings; ++i) {
    waveforms.push(new Float32Array(numWaveforms))
  }

  let channelData = []
  let channelDataOffset = 0

  const copyAndGetAverage = (source, target, start, length) => {
    let avg = 0
    for (let i = 0; i < length; ++i) {
      target[i] = source[start + i]
      avg += target[i]
    }

    return avg / length
  }

  const ramp = (elapsed, duration, minOut = 0, maxOut = 0.005) =>
    THREE.Math.clamp(THREE.Math.mapLinear(elapsed, 0, duration, minOut, maxOut), minOut, maxOut)

  loadAudio('MBIRA')
    .then(data => {
      console.log('song loaded')
      channelData = data
      waveforms.forEach((wf, i) =>
        copyAndGetAverage(channelData, wf, (channelDataOffset = numWaveforms * i), numWaveforms)
      )
    })
    .catch(error => console.error(error))

  let avg = 0
  let accumulatedSeconds = 0,
    shouldUpdate = false
  const render = () => {
    accumulatedSeconds += clock.getDelta()
    console.log(`Time since last update: ${accumulatedSeconds * 1000}`)

    shouldUpdate = channelData.length > 0 && accumulatedSeconds > 0.016

    if (shouldUpdate) {
      const wf = waveforms.pop()
      const nextAvg = copyAndGetAverage(
        channelData,
        wf,
        (channelDataOffset += numWaveforms) % channelData.length,
        numWaveforms
      )

      if (!isNaN(nextAvg)) {
        avg = Math.max(avg, avg + (nextAvg - avg) * 0.3)
      }
      waveforms.unshift(wf)

      const parent = parentRef.current
      const children = parent.children
      for (let i = 0; i < children.length; ++i) {
        const child = children[i]
        child.material.uniforms.waveform.value = waveforms[i]

        //const diff = (goal - rings[0].rotation.x) * ramp(elapsed, 10000)
        //child.rotation.x += diff
      }
      accumulatedSeconds = 0.0
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

        <Rings />
      </scene>
    )
  }
}
export default LiveScene
