import React from 'react'
import { extend } from 'react-three-fiber'
import { Rings } from './sound-enabled/Rings'
import { withSong } from './420/WithSong'
import Background from './Background'
import { BaseController } from './controllers/Base'

class InsideMusic extends React.PureComponent {
  constructor() {
    super()
    const ringComponents = [
      <Rings amplitude={1} name="battery" position={[-2, 0, 2]} rotateX={Math.PI * -0.5} waveformResolution={5} />,
      <Rings amplitude={2.4} name="guitar" position={[2, 0, -2]} waveformResolution={71} size={18} hue={0.3} />,
    ]

    const Song = withSong(ringComponents, 'take_me_out', 3)
    extend({ Song })
    this.Song = <Song />
  }

  render() {
    return this.Song
  }

  // dtor
  componentDidMount() {
    console.log('InsideMusic::componentDidMount')
  }

  componentWillUnmount() {
    console.log('InsideMusic::unmount')
  }
}

class WithScrollingBackground extends BaseController {
  render() {
    const { scrollMax, top } = this.props
    return (
      <scene ref={this.sceneRef}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <InsideMusic />
      </scene>
    )
  }
}

class InsideMusicScene extends BaseController {
  render() {
    return (
      <scene ref={this.sceneRef}>
        <InsideMusic />
      </scene>
    )
  }
}
export { InsideMusic, WithScrollingBackground as InsideMusicWithBackground, InsideMusicScene }
