import Tone from 'tone'
import events from 'events'

const { Transport, Buffer, BufferSource, Gain } = Tone

class SamplePlayer extends events.EventEmitter {
  trackName() {
    return `./audio/${this.folder}/${this.track}-${this.segment}.[mp3|ogg]`
  }
  constructor(folder, track, segments) {
    super()
    this.segment = 0
    this.folder = folder
    this.track = track

    this.loaded = false

    const firstBuffer = new Buffer(this.trackName(), () => {
      this.buffer = firstBuffer
      this.loaded = true
      this.emit('loaded')
    })
  }

  play(time, offset) {
    const source = new BufferSource(this.buffer)
    source.connect(this.output)
    source.start()
  }

  getWaveform(array) {
    if (Transport.seconds === 0) {
      for (let i = 0; i < array.length; ++i) {
        array[i] = 0
      }
    } else {
      const sample = Math.floor(1 * Transport.context.sampleRate)
      const buffer = this.buffer
      if (buffer && sample < buffer.length) {
        buffer.get().copyFromChannel(array, 0, sample)
      }
    }
  }
}

export { SamplePlayer }
