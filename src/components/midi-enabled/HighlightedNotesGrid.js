import React, { useRef } from 'react'
import events from 'events'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import { Transport } from 'tone'
import midi from '../../util/WebMidi'
import clock from '../../util/Clock'
import { ShaderChunk } from 'three/src/renderers/shaders/ShaderChunk'
import { useSpring, useSprings, animated } from 'react-spring/three'
import { VertexShader, FragmentShader } from '../../shaders/KickDrumRingShader'
import { SamplePlayer } from '../../sound-player/SamplePlayer'

class RingPointMaterial extends THREE.RawShaderMaterial {
  constructor(options) {
    const { amplitude, opacity, size, blending, shape, radius, waveformResolution, color } = options
    const waveform = new Float32Array(waveformResolution)
    for (let i = 0; i < waveformResolution; i++) {
      waveform[i] = 0
    }
    super({
      fog: true,
      blending,
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      transparent: true,
      uniforms: {
        waveform: {
          type: 'fv1',
          value: waveform,
        },
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
        waveformResolution: {
          type: 'i',
          value: 32,
        },
      },
    })
  }
}

class RingBufferGeometry extends THREE.BufferGeometry {
  constructor(options) {
    super(new THREE.BufferGeometry())

    const { waveformResolution } = options

    //position attribute, needs to be there,
    //but its calculated in the vertex shader
    const positions = new Float32Array(waveformResolution * 3)
    const posAttribute = new THREE.BufferAttribute(positions, 3)
    this.addAttribute('position', posAttribute)

    //index attribute, each point gets an index for reference on the waveform uniform
    const reference = new Float32Array(waveformResolution)
    for (let i = 0; i < waveformResolution; i++) {
      reference[i] = i / waveformResolution
    }

    const referenceAttribute = new THREE.BufferAttribute(reference, 1)
    this.addAttribute('reference', referenceAttribute)

    // since the positions are set in shader,
    // we need a custom boundingSphere to a void erroneous culling
    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0.52)
  }
}

/**
 * RingPoints
 * the `Object3D` for a single circle of particles
 * @extends THREE.Points
 * @see RingPointMaterial
 * @param {Object} [options] check `RingPointMaterial` for properties
 */
class RingPoints extends THREE.Points {
  constructor(options) {
    const geom = new RingBufferGeometry({ waveformResolution: options.waveformResolution })

    super(geom, new RingPointMaterial(options))

    this.renderOrder = 2
  }
}

const KickDrum = props => {
  const rings = []
  const components = []

  let {
    rotateX,
    rotateY,
    rotateZ,
    position,
    scale,
    size,
    color,
    numRings,
    waveformResolution,
    hue,
    sat,
    lit,
    player,
    amplitude,
  } = props
  numRings = numRings || 72
  rotateX = rotateX === null || rotateX === undefined ? 0 : rotateX
  rotateY = rotateY === null || rotateY === undefined ? 0.0 : rotateY
  rotateZ = rotateZ === null || rotateZ === undefined ? 0.0 : rotateZ
  position = position || new THREE.Vector3(0, 0, 0)
  scale = scale === null || scale === undefined ? 1.0 : scale
  size = size || 38
  color = color || new THREE.Color()
  numRings = numRings || 72
  waveformResolution = waveformResolution || 80
  hue = hue || 0
  sat = sat || 0
  lit = lit || (ref => 1 - ref)
  amplitude = amplitude || 1.0

  let ref = 0

  for (let i = 0; i < numRings; ++i) {
    ref = i / numRings
    const hueVal = typeof hue === 'function' ? hue(ref) : hue
    const satVal = typeof sat === 'function' ? sat(ref) : sat
    const litVal = typeof lit === 'function' ? lit(ref) : lit
    const ring = new RingPoints({
      radius: i * 0.05 + 0.5,
      waveformResolution,
      color: new color.setHSL(hueVal, satVal, litVal),
      opacity: Math.min(1, THREE.Math.mapLinear(numRings - i, numRings, 1, 4.0, 0.3)),
      blending: THREE.NormalBlending,
      shape: 'circle',
      size,
      amplitude,
    })
    ring.rotateX(rotateX)
    ring.rotateY(rotateY)
    ring.rotateZ(rotateZ)
    rings.push(ring)
  }

  let elapsed = 0,
    amp = 0

  let waveforms = []
  for (let i = 0; i < numRings; ++i) {
    waveforms.push(new Float32Array(waveformResolution))
  }

  const render = () => {
    elapsed = clock.getElapsedTime()

    if (player && Transport.state === 'started') {
      const wf = waveforms.pop()
      player.getWaveform(wf)
      waveforms.unshift(wf)

      if (player && player.isLoaded()) {
        const parent = parentRef.current
        const children = parent.children
        for (let i = 0; i < children.length; ++i) {
          const child = children[i]
          child.material.uniforms.waveform.value = waveforms[i]
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
    <group position={position} ref={parentRef} scale={[scale, scale, scale]}>
      {components}
    </group>
  )
}

class KickDrumWithPlayer extends React.Component {
  constructor() {
    super()
    this.audioFileStatusEmitter = new events.EventEmitter()
    this.player = new SamplePlayer({
      name: 'sango_kick_11',
      folder: 'kickdrum',
    })
    this.player.on('sample-ready', () => {
      if (this.player.isLoaded()) {
        this.player.onSongStart()
        if (Transport.state !== 'started') {
          Transport.start()
        }
      }
    })
  }

  render() {
    return <KickDrum player={this.player} />
  }
}

const HighlightedNotesGrid = props => {
  const width = 5,
    height = 9
  const points = []
  const startNote = 35

  let index = 0
  for (let i = 0; i < width; ++i) {
    for (let j = 0; j < height; ++j) {
      let x = i * 0.5 - 3
      let y = j * 0.5 - 2.5
      let z = 0

      if (index % 2 !== 0) {
        x += 3
        y += 0.5
      }
      points.push([x, y, z])
    }
    index++
  }
  const [springs, setSprings] = useSprings(points.length, i => {
    const position = points[i]
    return {
      from: { position },
      config: { mass: 100, tension: 10000, friction: 1000 },
    }
  })

  const sphereGeometry = new THREE.SphereBufferGeometry(0.05, 10, 10)
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('white'),
    transparent: true,
    opacity: 0.5,
    wireframe: true,
  })

  midi.addListener(
    'noteon',
    note => {
      const position = points[note.number - startNote]
      setSprings(i => {
        if (i === note.number - startNote) {
          return { position: [position[0], position[1], position[2] + 2] }
        }
      })
    },
    'HighlightedNotesGrid'
  )

  midi.addListener(
    'noteoff',
    note => {
      const position = points[note.number - startNote]
      setSprings(i => {
        if (i === note.number - startNote) {
          return { position }
        }
      })
    },
    'HighlightedNotesGrid'
  )

  return springs.map(({ position }, index) => {
    return <animated.mesh position={position} key={index} material={material} geometry={sphereGeometry} />
  })
}

export { HighlightedNotesGrid, KickDrum, KickDrumWithPlayer }
