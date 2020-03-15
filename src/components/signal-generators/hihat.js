import { NoiseSynth, Filter, AudioNode } from 'tone'

const hihat = () => {
  const audioNode = new AudioNode()

  const lowPass = new Filter({ frequency: 14000 }).connect(audioNode)
  const hihat = new NoiseSynth({
    volume: -10,
    filter: {
      Q: 1,
    },
    envelope: {
      attack: 0.01,
      decay: 0.15,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.03,
      baseFrequency: 4000,
      octaves: -2.5,
      exponent: 4,
    },
  }).connect(lowPass)

  const triggerFn = () => {
    hihat.triggerAttack()
    return lowPass
  }
  return { signal: hihat, triggerFn }
}

export { hihat }
