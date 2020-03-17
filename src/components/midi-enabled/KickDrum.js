import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import midi from '../../util/WebMidi'
import clock from '../../util/Clock'
import { VertexShader, FragmentShader } from '../../shaders/KickDrumShader'
import { kick } from '../signal-generators/kick'

class RingPointMaterial extends THREE.RawShaderMaterial {
  constructor(options) {
    const { amplitude, opacity, size, blending, shape, radius, numPointsPerRing, color } = options
    super({
      fog: true,
      blending,
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
        numPointsPerRing: {
          type: 'i',
          value: numPointsPerRing,
        },
        amplitudeValue: {
          type: 'f',
          value: 0,
        },
      },
    })
  }
}

class RingBufferGeometry extends THREE.BufferGeometry {
  constructor(options) {
    super(new THREE.BufferGeometry())

    const { numPointsPerRing } = options

    //position attribute, needs to be there,
    //but its calculated in the vertex shader
    const positions = new Float32Array(numPointsPerRing * 3)
    const posAttribute = new THREE.BufferAttribute(positions, 3)
    this.addAttribute('position', posAttribute)

    // give each point on the ring a reference index
    const reference = new Float32Array(numPointsPerRing)
    for (let i = 0; i < numPointsPerRing; i++) {
      reference[i] = i / numPointsPerRing
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
    const geom = new RingBufferGeometry({ numPointsPerRing: options.numPointsPerRing })
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
    numPointsPerRing,
    hue,
    sat,
    lit,
    amplitude,
  } = props
  numRings = numRings || 30
  rotateX = rotateX === null || rotateX === undefined ? 0 : rotateX
  rotateY = rotateY === null || rotateY === undefined ? 0.0 : rotateY
  rotateZ = rotateZ === null || rotateZ === undefined ? 0.0 : rotateZ
  position = position || new THREE.Vector3(0, 0, 0)
  scale = scale === null || scale === undefined ? 1.0 : scale
  size = size || 38
  color = color || new THREE.Color()
  numPointsPerRing = numPointsPerRing || 80
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
      numPointsPerRing,
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

  const { signal, triggerFn } = kick()
  const width = numRings
  let kickValue = 0,
    phase = 0,
    yCoord = 0,
    kickWaveformData = new Array(width).fill(0)

  const render = () => {
    for (let i = 0; i < width; ++i) {
      kickValue = signal.value
      yCoord = Math.sin(i / 60 + phase) * kickValue
      kickWaveformData[i] = yCoord
    }
    //increasing phase means that the kick wave will
    //not be standing and looks more dynamic
    phase++
    const parent = parentRef.current
    const children = parent.children
    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      child.material.uniforms.amplitudeValue.value = kickWaveformData[kickWaveformData.length - i]
    }
  }

  useRender(render)

  midi.addAbletonListener('noteon', triggerFn, 0, 'KickDrumListener')

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

export { KickDrum }
