import Tone from 'tone'
import events from 'events'

const { Transport, Buffer, BufferSource, Gain } = Tone

//each segment is 30 seconds
const SEG_TIME = 30

export class StreamingPlayer extends events.EventEmitter {
  trackName() {
    return `./audio/${this.folder}/${this.track}-${this.segment}.[mp3|ogg]`
  }

  constructor(folder, track, segments) {
    super()
    this.segment = 0
    this.folder = folder
    this.track = track

    this.totalSegments = segments

    this.output = new Gain()
    this.playingSource = null

    // Transport source code: https://github.com/Tonejs/Tone.js/blob/13.8.25/Tone/core/Transport.js
    // https://github.com/Tonejs/Tone.js/wiki/Transport#schedulerepeatcallback-interval-starttime-duration
    this.id = Transport.scheduleRepeat(
      time => {
        // remove previous source
        this.playSegment(this.segment, time, 0)
        // load next segment
        this.segment++
        this.loadNext()
      },
      30,
      0
    )

    this.started = false

    this._startMethod = (time, offset) => {
      console.log('StreamingPlayer::_startMethod')
      // paused and resumed
      if (this.started) {
        const segment = Math.floor(offset / SEG_TIME)
        this.playSegment(segment, time, offset - segment * SEG_TIME)
      }
      this.started = true
    }

    this._pauseMethod = time => {
      console.log('StreamingPlayer::_pauseMethod')
      if (this.playingSource) {
        this.playingSource.stop(time, 0.1)
      }
    }

    this._stopMethod = time => {
      console.log('StreamingPlayer::_stopMethod')
      this.buffers = []
    }

    Transport.on('start', this._startMethod)
    Transport.on('pause stop', this._pauseMethod)
    Transport.on('stop', this._stopMethod)

    this.buffers = []
    this.buffering = false
    this.loaded = false

    const firstBuffer = new Buffer(this.trackName(), () => {
      this.buffers[0] = firstBuffer
      this.loaded = true
      this.emit('loaded')
    })
  }

  loadNext() {
    if (!this.buffers[this.segment]) {
      const seg = this.segment
      if (seg <= this.totalSegments) {
        setTimeout(() => {
          const nextBuffer = new Buffer(this.trackName(), () => {
            if (this.buffering) {
              this.buffering = false
              this.emit('bufferingEnd')
            }
            if (this.buffers[seg - 2]) {
              this.buffers[seg - 2] = null
            }
            this.buffers[seg] = nextBuffer
          })
        }, Math.random() * 5000 + 1000)
      }
    }
  }

  playSegment(seg, time, offset) {
    if (this.buffers[seg]) {
      const source = new BufferSource(this.buffers[seg])
      source.connect(this.output)
      source.start(time, offset)
      this.playingSource = source
    } else {
      this.emit('buffering')
      this.buffering = true
    }
  }

  getWaveform(array) {
    if (Transport.seconds === 0) {
      for (let i = 0; i < array.length; ++i) {
        array[i] = 0
      }
    } else {
      const segNum = Math.floor(Transport.seconds / SEG_TIME)
      const offset = Transport.seconds - segNum * SEG_TIME
      const sample = Math.floor(offset * Transport.context.sampleRate)
      const buffer = this.buffers[segNum]
      if (buffer && sample < buffer.length) {
        buffer.get().copyFromChannel(array, 0, sample)
      }
    }
  }

  dispose() {
    Transport.off('start', this._startMethod)
    Transport.off('pause stop', this._pauseMethod)
    Transport.off('stop', this._stopMethod)
    Transport.clear(this.id)
    this.removeAllListeners('buffering')
    this.removeAllListeners('bufferingEnd')
    this.removeAllListeners('loaded')
    setTimeout(() => {
      this.output.dispose()
    }, 500)
  }
}
