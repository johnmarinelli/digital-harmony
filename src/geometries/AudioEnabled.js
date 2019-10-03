import * as THREE from 'three'
class AudioEnabledBufferGeometry extends THREE.BufferGeometry {
  constructor(options = { waveformResolution: 128 }) {
    super(new THREE.BufferGeometry())

    const { waveformResolution } = options

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

export { AudioEnabledBufferGeometry }
