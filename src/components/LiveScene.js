import React from 'react'
import { extend } from 'react-three-fiber'
import Background from './Background'
import { Rings } from './sound-enabled/Rings'
import { withSong } from './sound-enabled/WithSong'

class LiveScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const ringComponents = [
      <Rings amplitude={1} name="battery" position={[-2, 0, 2]} rotateX={Math.PI * -0.5} waveformResolution={5} />,
      <Rings amplitude={2.4} name="guitar" position={[2, 0, -2]} waveformResolution={71} size={18} hue={0.3} />,
    ]

    const Song = withSong(ringComponents, 'take_me_out', 3)
    extend({ Song })
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
        <Song />
      </scene>
    )
  }
}
export default LiveScene
