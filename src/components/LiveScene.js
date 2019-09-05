import React, { useMemo, useRef } from 'react'
import { extend, useRender } from 'react-three-fiber'
import * as THREE from 'three'
import Background from './Background'
import { VertexShader, FragmentShader } from '../shaders/LiveSceneShader'
import Tone from 'tone'
import clock from '../util/Clock'

const loadAudio = baseFilename => {
  return new Promise(resolve => {
    const path = `/audio/take_me_out/split/${baseFilename}-0.mp3`
    new Tone.Buffer(path, buffer => {
      resolve(buffer.getChannelData(0))
    })
  })
}

class RingPointMaterial extends THREE.RawShaderMaterial {
  constructor(
    options = {
      opacity: 1,
      size: 1,
      blending: THREE.NormalBlending,
      shape: 'circle',
      radius: 1.0,
      color: new THREE.Color(0xff00ff),
      resolution: 128,
    }
  ) {
    const { opacity, size, blending, shape, radius, resolution, color } = options

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
          value: 1.0,
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
      //opacity: Math.min(1, THREE.Math.mapLinear(numRings - i, numRings, 1, 4.0, 0.3)),
      opacity: 1,
      blending: THREE.AdditiveBlending,
      shape: 'circle',
    })
    const geometry = new RingBufferGeometry({ resolution: 120 })
    const ring = new THREE.Points(geometry, material)
    ring.renderOrder = 2
    ring.goalProperties = { radius: material.uniforms.radius.value, opacity: material.uniforms.opacity.value }
    ring.rotateX(-Math.PI / 2.5)
    rings.push(ring)
  }
  const waveforms = new Array(numRings).fill(new Float32Array(numWaveforms))
  let channelData = []
  let channelDataOffset = 0

  loadAudio('take_me_out_bossa_inside_sound_experiment_battery')
    .then(data => {
      channelData = data
      waveforms.forEach((wf, i) =>
        copyAndGetAverage(channelData, wf, (channelDataOffset = numWaveforms * i), numWaveforms)
      )
    })
    .catch(error => console.error(error))

  const copyAndGetAverage = (source, target, start, length) => {
    let avg = 0
    for (let i = 0; i < length; ++i) {
      target[i] = source[start + i]
      avg += target[i]
    }

    return avg / length
  }

  useRender(() => {
    const wf = waveforms.pop()
    /*
    const nextAvg = copyAndGetAverage(channelData, wf, (channelDataOffset += numWaveforms) % channelData.length, numWaveforms)
    const now = clock.getElapsedTime()
    const t = THREE.Math.clamp((now - 500) / 8000, 0, 1)

    for (let i = 0; i < numRings; ++i) {
      const ring = rings[i]
      for (let propName in ring.goalProperties) {
        const uniform = ring.material.uniforms[propName]
        uniform.value = THREE.Math.lerp(0, ring.goalProperties[propName], ease.expoInOut(t))
      }
    }
    */
  })

  for (let i = 0; i < numRings; ++i) {
    const ring = rings[i]
    components.push(<primitive object={ring} key={i} />)
  }
  return components
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
