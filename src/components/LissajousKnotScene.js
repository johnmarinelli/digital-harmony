import React from 'react'
import Background from './Background'
import GuiOptions from './Gui'
import { BaseController } from './controllers/Base'
import { LissajousKnot } from './LissajousKnot'

class LissajousKnotScene extends BaseController {
  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5

    const { options: { lissajousKnotVisible, sphereScale, lissajousKnotDiscrete } } = GuiOptions

    return (
      <scene ref={this.sceneRef}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#e82968', '#eec919', '#504006', '#e32f01']
          )}
        />
        <LissajousKnot
          lissajousKnotVisible={lissajousKnotVisible}
          sphereScale={sphereScale}
          lissajousKnotDiscrete={lissajousKnotDiscrete}
          timeScale={0.1}
        />
      </scene>
    )
  }
}
export default LissajousKnotScene
