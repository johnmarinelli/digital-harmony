import React from 'react'
import Background from './Background'
import { TwistingWaveFields } from './sound-enabled/TwistingWaveField'

class WaveFieldScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5

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
export default WaveFieldScene
