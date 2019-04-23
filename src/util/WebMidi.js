import WebMidi from 'webmidi'
const NoteMapping = {
  on: false,
  startedAt: 0.0,
  endedAt: 0.0,
  noteOnVelocity: 0.0,
  noteOffVelocity: 0.0,
}

/* eslint-disable-next-line */
const MIDI_NOTE_ON = 144
/* eslint-disable-next-line */
const MIDI_NOTE_OFF = 128

const NUM_LAST_NOTES = 5
class WebMidiWrapper {
  constructor() {
    this.keyboard = null

    this.noteOnListeners = []
    this.noteOffListeners = []

    this.noteArray = {}

    for (let i = 21; i < 109; ++i) {
      this.noteArray[i] = Object.assign({}, NoteMapping)
    }

    this.lastNotes = []
    WebMidi.enable(err => {
      if (err) {
        console.log('WebMid could not be enabled: ', err)
        return
      }

      if (WebMidi.inputs.length === 0) {
        return
      }

      this.keyboard = WebMidi.inputs[0]
      this.keyboard.addListener('noteon', 'all', this.noteOn)
      this.keyboard.addListener('noteoff', 'all', this.noteOff)
    }, true)
  }

  noteOn = event => {
    const { note: { number } } = event

    this.noteArray[number].on = true
    this.noteArray[number].startedAt = event.timestamp / 1000.0
    this.noteArray[number].noteOnVelocity = event.velocity

    this.noteArray[number].endedAt = 0.0
    this.noteArray[number].noteOffVelocity = 0.0

    if (this.lastNotes.length >= NUM_LAST_NOTES) {
      this.lastNotes.pop()
    }
    this.lastNotes.unshift(number)

    console.log(this.lastNotes)
  }

  noteOff = event => {
    //console.log(event)
    const { note: { number } } = event

    this.noteArray[number].on = false
    this.noteArray[number].endedAt = event.timestamp / 1000.0
    this.noteArray[number].noteOffVelocity = event.velocity

    this.noteArray[number].startedAt = 0.0
    this.noteArray[number].noteOnVelocity = 0.0
  }

  // z. B. addListener('noteon', listener)
  addListener(event, listener) {
    this.keyboard.addListener(event, 'all', listener)
  }
}

const webmidi = new WebMidiWrapper()
export default webmidi
