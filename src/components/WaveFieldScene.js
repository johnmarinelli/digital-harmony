import React from 'react'
import Background from './Background'
import { TwistingWaveFields } from './sound-enabled/TwistingWaveField'
import { BaseController } from './controllers/Base'

class WaveFieldScene extends BaseController {
  render() {
    const { top, scrollMax } = this.props

    return (
      <scene ref={this.sceneRef}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <TwistingWaveFields />
      </scene>
    )
  }
}
export { WaveFieldScene }
