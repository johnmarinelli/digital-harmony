import * as THREE from 'three'
import { VertexShader, FragmentShader } from '../../shaders/LiveSceneShader'

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
export { RingPoints }
