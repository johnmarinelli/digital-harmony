import * as THREE from 'three'

class AudioEnabledShaderMaterial extends THREE.ShaderMaterial {
  constructor(options) {
    const { waveformResolution } = options
    delete options.waveform

    // represents a streaming array of floating point data,
    // that is coming from the sound/Player.js class
    const waveform = new Float32Array(waveformResolution)
    for (let i = 0; i < waveformResolution; i++) {
      waveform[i] = 0
    }
    options.uniforms.waveform = {
      type: 'fv1',
      value: waveform,
    }
    delete options.waveformResolution

    options.defines = options.defines ? options.defines : {}
    options.defines.WAVEFORM_RESOLUTION = waveformResolution

    super(options)
    this.waveformUniformChunk = `uniform float waveform[${waveformResolution}];\nattribute float reference;`
  }

  onBeforeCompile(shader) {
    shader.fragmentShader = shader.fragmentShader.replace('#include <waveform_chunk>', this.waveformUniformChunk)
    shader.vertexShader = shader.vertexShader.replace('#include <waveform_chunk>', this.waveformUniformChunk)
  }
}

class AudioEnabledRawShaderMaterial extends THREE.RawShaderMaterial {
  constructor(options) {
    const { waveformResolution } = options
    delete options.waveform

    // represents a streaming array of floating point data,
    // that is coming from the sound/Player.js class
    const waveform = new Float32Array(waveformResolution)
    for (let i = 0; i < waveformResolution; i++) {
      waveform[i] = 0
    }
    options.uniforms.waveform = {
      type: 'fv1',
      value: waveform,
    }
    delete options.waveformResolution

    options.defines = options.defines ? options.defines : {}
    options.defines.WAVEFORM_RESOLUTION = waveformResolution

    super(options)
    this.waveformUniformChunk = `uniform float waveform[${waveformResolution}];`
  }

  onBeforeCompile(shader) {
    shader.fragmentShader = shader.fragmentShader.replace('#include <waveform_chunk>', this.waveformUniformChunk)
    shader.vertexShader = shader.vertexShader.replace('#include <waveform_chunk>', this.waveformUniformChunk)
  }
}

/*
 * IMPORTANT NOTE - this class does not handle creating a shader.
 * it only takes care of "connecting" the audio data to a given shader.
 */
class AudioEnabledLineMaterial extends THREE.ShaderMaterial {
  constructor(options) {
    const { waveformResolution } = options
    // represents a streaming array of floating point data,
    // that is coming from the sound/Player.js class
    const waveform = new Float32Array(waveformResolution)
    for (let i = 0; i < waveformResolution; i++) {
      waveform[i] = 0
    }
    const uniforms = Object.assign({}, options.uniforms, {
      waveform: {
        type: 'fv1',
        value: waveform,
      },
    })

    const defines = Object.assign({}, options.defines, {
      WAVEFORM_RESOLUTION: waveformResolution,
    })

    delete options.waveformResolution

    options.uniforms = THREE.UniformsUtils.merge([uniforms])
    options.defines = defines
    //options.linewidth = 1
    //options.linecap = 'round'
    //options.linejoin = 'round'
    super(options)

    this.waveformUniformChunk = `uniform float waveform[${waveformResolution}];`
  }

  onBeforeCompile(shader) {
    shader.fragmentShader = shader.fragmentShader.replace('#include <waveform_chunk>', this.waveformUniformChunk)
    shader.vertexShader = shader.vertexShader.replace('#include <waveform_chunk>', this.waveformUniformChunk)
  }
}

export { AudioEnabledRawShaderMaterial, AudioEnabledLineMaterial, AudioEnabledShaderMaterial }
