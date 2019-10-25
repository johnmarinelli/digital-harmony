import React, { useRef, useEffect } from 'react'
import { apply as applySpring, animated as anim } from 'react-spring/three'
import { extend as applyThree, useThree } from 'react-three-fiber'
import { Voronoi3D } from '../postprocessing/Voronoi3D'
import { EffectComposer } from '../postprocessing/EffectComposer'
import { RenderPass } from '../postprocessing/RenderPass'
import { GlitchPass } from '../postprocessing/GlitchPass'
import clock from '../util/Clock'
import Text from './Text'
import { BaseController } from './controllers/Base'

applySpring({ EffectComposer, RenderPass, GlitchPass })
applyThree({ EffectComposer, RenderPass, GlitchPass })

class VoronoiScene extends BaseController {
  render() {
    const { top, scrollMax } = this.props
    return (
      <scene ref={this.sceneRef}>
        <anim.spotLight intensity={1.2} color="black" />
        <Voronoi3D
          clock={clock}
          segments={[0, scrollMax * 0.25, scrollMax * 0.8, scrollMax]}
          colorPalette={['#D358B1', '#AE1B85', '#FF7070', '#F3B1E1']}
          top={top}
          voronoiScale={top.interpolate([0, scrollMax * 0.25, scrollMax * 0.8, scrollMax], [0.0, 5.0, 10.0, 20.0])}
          datGuiOverride={false}
        />
        <Text
          opacity={top.interpolate([0, 200], [1, 0])}
          position={top.interpolate(top => [0, -1 + top / 200.0, 0])}
          color="black"
          fontSize={150}
        >
          rêverie
        </Text>
      </scene>
    )
  }
}

export { VoronoiScene }
