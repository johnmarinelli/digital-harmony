import { StreamingPlayer } from './StreamingPlayer'
import Tone from 'tone'

const { Gain, Panner3D } = Tone

class SoundPlayer {
  constructor({ position, name, folder, segments, eventEmitterRef }) {
    this.name = name
    this.folder = folder
    this.segments = segments
    this.numSamples = 64
    this.eventEmitterRef = eventEmitterRef
    this.position = position

    this.init()
    this.update(position)
  }

  init() {
    this._panner = new Panner3D({
      roloffFactor: 1.25,
      panningModel: 'equalpower',
    }).toMaster()

    this._rms = 0
    this._amplitudeArray = new Float32Array(this.numSamples)
    this._boost = new Gain().connect(this._panner)
    this._level = new Gain().connect(this._boost)
  }

  onSongStart() {
    this._level.gain.cancelScheduledValues()
    this._level.gain.value = 1
  }

  getWaveform(array) {
    if (this._player) {
      this._player.getWaveform(array)
    }
  }

  getAmplitude() {
    // average over last 64 samples
    const { _player, _amplitudeArray, numSamples } = this

    if (_player) {
      const smoothing = 0.7

      if (this.isActive) {
        this.getWaveform(_amplitudeArray)
        const samples = _amplitudeArray

        let total = 0

        for (let i = 0; i < samples.length; ++i) {
          total += samples[i] * samples[i]
        }
        total = Math.sqrt(total / numSamples)

        if (total > 0.001) {
          total += 0.4
        }
        const avg = smoothing * this._rms + (1 - smoothing) * total
        this._rms = Math.max(avg, this._rms * 0.98)
      } else {
        this._rms = 0.95 * this._rms
      }
      return this._rms
    } else {
      return 0
    }
  }

  onPlayerLoaded() {
    this.eventEmitterRef.emit('player-ready')
  }

  onPlayerBuffering() {
    console.log('onPlayerBuffering: ', arguments)
  }

  onPlayerBufferingEnd() {
    console.log('onPlayerBufferingEnd: ', arguments)
  }

  // call this manually, when you want to change this Player's track
  update(position) {
    this.position = position
    this._panner.setPosition(position.x, position.y, position.z)

    if (this._player) {
      this._player.dispose()
      this._player = null
    }
    this._player = new StreamingPlayer(this.folder, this.name, this.segments)
    this._player.output.connect(this._level)

    this._player.on('loaded', this.onPlayerLoaded.bind(this))
    this._player.on('buffering', this.onPlayerBuffering)
    this._player.on('bufferingEnd', this.onPlayerBufferingEnd)
  }

  isLoaded() {
    return this._player && this._player.loaded
  }

  isBuffering() {
    return this._player && this._player.buffering
  }
}

export default SoundPlayer
