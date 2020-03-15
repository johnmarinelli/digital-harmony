import { AudioNode, Oscillator, AmplitudeEnvelope, FrequencyEnvelope } from 'tone'

const kick = () => {
  const audioNode = new AudioNode()
  const envelope = new AmplitudeEnvelope({ attack: 0.01, decay: 0.5, sustain: 0 }).connect(audioNode)
  const osc = new Oscillator('A2').connect(envelope).start()
  const snapEnvelope = new FrequencyEnvelope({
    attack: 0.005,
    decay: 0.01,
    sustain: 0,
    baseFrequency: 'A2',
    octaves: 2.7,
  }).connect(osc.frequency)

  const triggerFn = () => {
    envelope.triggerAttack()
    snapEnvelope.triggerAttack()
    return envelope
  }
  return { signal: envelope, triggerFn }
}

export { kick }
