import * as THREE from 'three'
import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import { VertexShader, FragmentShader } from '../../shaders/LiveSceneShader'
import clock from '../../util/Clock'
import { Transport } from 'tone'
import { AudioEnabledRawShaderMaterial } from '../../materials/AudioEnabled'

class RingPointMaterial extends AudioEnabledRawShaderMaterial {
  constructor(options) {
    const { amplitude, opacity, size, blending, shape, radius, waveformResolution, color } = options
    super({
      waveformResolution,
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

const ease = t =>
  t === 0.0 || t === 1.0
    ? t
    : t < 0.5 ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0) : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0

const Rings = props => {
  const rings = []
  const components = []

  let { rotateX, position, size, color, numRings, waveformResolution, hue, sat, lit, player, amplitude } = props
  numRings = numRings || 72
  rotateX = rotateX || Math.PI * 0.25
  position = position || new THREE.Vector3(0, 0, 0)
  size = size || 38
  color = color || new THREE.Color()
  numRings = numRings || 72
  waveformResolution = waveformResolution || 80
  hue = hue || 0
  sat = sat || 0
  lit = lit || (ref => 1 - ref)

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
          if (i === 0) {
            //console.log(child.material.uniforms)
          }
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
export { Rings }
