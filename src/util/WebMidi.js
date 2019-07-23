import WebMidi from 'webmidi'
import clock from '../util/Clock'

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

    this.noteOnListeners = {}
    this.noteOffListeners = {}

    this.lastNoteOnStartedAt = 0.0

    this.noteArray = {}

    for (let i = 21; i < 109; ++i) {
      this.noteArray[i] = Object.assign({}, NoteMapping)
    }

    // stores last `NUM_LAST_NOTES` notes played
    // should not write anything to this directly, because
    // it's a circular queue but looks like an array.
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

    // edge case for VMPK
    if (event.timestamp === 0) {
      event.timestamp = clock.getElapsedTime() * 1000
    }

    this.noteArray[number].number = number
    this.noteArray[number].on = true
    this.noteArray[number].startedAt = event.timestamp / 1000.0
    this.noteArray[number].noteOnVelocity = event.velocity

    this.noteArray[number].endedAt = 0.0
    this.noteArray[number].noteOffVelocity = 0.0

    if (this.lastNotes.length >= NUM_LAST_NOTES) {
      this.lastNotes.shift()
    }
    this.lastNotes.push(number)
    this.lastNoteOnStartedAt = this.noteArray[number].startedAt
    const noteOnListenerNames = Object.keys(this.noteOnListeners)

    noteOnListenerNames.forEach(
      listenerName =>
        listenerName === 'undefined'
          ? console.error('Attempted to access undefined listener name.')
          : this.noteOnListeners[listenerName](this.noteArray[number])
    )
  }

  noteOff = event => {
    //console.log(event)
    const { note: { number } } = event

    this.noteArray[number].number = number
    this.noteArray[number].on = false
    this.noteArray[number].endedAt = event.timestamp / 1000.0
    this.noteArray[number].noteOffVelocity = event.velocity

    //this.noteArray[number].startedAt = 0.0
    this.noteArray[number].noteOnVelocity = 0.0
    const noteOffListenerNames = Object.keys(this.noteOffListeners)

    noteOffListenerNames.forEach(
      listenerName =>
        listenerName === 'undefined'
          ? console.error('Attempted to access undefined listener name.')
          : this.noteOffListeners[listenerName](this.noteArray[number], number)
    )
  }

  // z. B. addListener('noteon', listener, listenerName)
  addListener(event, listener, listenerName) {
    if (event === 'noteon') {
      this.noteOnListeners[listenerName] = listener
      return true
    } else if (event === 'noteoff') {
      this.noteOffListeners[listenerName] = listener
      return true
    } else {
      this.keyboard.addListener(event, 'all', listener)
      return true
    }
  }
}

const webmidi = new WebMidiWrapper()
export default webmidi
