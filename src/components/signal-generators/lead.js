import { PulseOscillator, AudioNode, Filter, Oscillator, AmplitudeEnvelope, FrequencyEnvelope } from 'tone'

const lead = () => {
  const audioNode = new AudioNode()
  const envelope = new AmplitudeEnvelope({ attack: 0.6, decay: 0.2, sustain: 0.2, release: 0.2 }).connect(audioNode)
  const filter = new Filter({
    frequency: 50,
    Q: 1,
    type: 'highpass',
  })
  const signal = new PulseOscillator('A0', 0.4).chain(filter, envelope)
  signal.start()

  const triggerFn = () => {
    envelope.triggerRelease()
    envelope.triggerAttack()
    signal.frequency.value = 'A0'
    return envelope
  }
  return { signal: envelope, triggerFn }
}

export { lead }
