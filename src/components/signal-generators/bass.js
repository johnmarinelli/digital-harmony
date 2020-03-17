import { PulseOscillator, AudioNode, Filter, Oscillator, AmplitudeEnvelope, FrequencyEnvelope } from 'tone'

const bass = () => {
  const audioNode = new AudioNode()
  const envelope = new AmplitudeEnvelope({ attack: 0.1, decay: 1.5, sustain: 0 }).connect(audioNode)
  const filter = new Filter({
    frequency: 600,
    Q: 8,
  })
  const signal = new PulseOscillator('A2', 0.4).chain(filter, envelope)
  signal.start()

  const triggerFn = () => {
    envelope.triggerAttack()
    signal.frequency.value = 'A2'
    return envelope
  }
  return { signal: envelope, triggerFn }
}

export { bass }
