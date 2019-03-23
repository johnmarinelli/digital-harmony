import React, { Component, useRef, useEffect } from 'react'
import { apply as applySpring, useSpring, animated as anim } from 'react-spring/three'
import { apply as applyThree, Canvas, useRender, useThree } from 'react-three-fiber'
import { Voronoi3D, Voronoi3DPass } from '../postprocessing/Voronoi3D'
import { EffectComposer } from '../postprocessing/EffectComposer'
import { RenderPass } from '../postprocessing/RenderPass'
import { GlitchPass } from '../postprocessing/GlitchPass'
import clock from '../util/Clock'
import Text from './Text'

applySpring({ EffectComposer, RenderPass, GlitchPass, Voronoi3DPass })
applyThree({ EffectComposer, RenderPass, GlitchPass, Voronoi3DPass })

const Effects = ({ factor }) => {
  // scene comes from "stateContext" from here:
  // https://github.com/drcmda/react-three-fiber/blob/master/src/canvas.js
  const { gl, scene, camera, size } = useThree()
  const composer = useRef()

  useEffect(
    () => {
      composer.current.obj.setSize(size.width, size.height)
    },
    [size.width, size.height, composer.current]
  )
  // This takes over as the main render-loop (when 2nd arg is set to true)
  //useRender(() => composer.current.obj.render(), true)
  //useRender(() => composer.current.obj.render())

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass name="passes" args={[scene, camera]} />
      <anim.glitchPass name="glitchPass" renderToScreen factor={factor} />
    </effectComposer>
  )
}

class VoronoiScene extends Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5

    return (
      <scene ref={this.sceneRef}>
        <anim.spotLight intensity={1.2} color="black" />
        <Voronoi3D
          clock={clock}
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#D358B1', '#AE1B85', '#FF7070', '#F3B1E1']
          )}
          voronoiScale={top.interpolate([0, scrollMax * 0.25, scrollMax * 0.8, scrollMax], [0.0, 5.0, 10.0, 20.0])}
        />
        <Text
          opacity={top.interpolate([0, 200], [1, 0])}
          position={top.interpolate(top => [0, -1 + top / 200.0, 0])}
          color="black"
          fontSize={150}
        >
          rêverie
        </Text>
        <Effects factor={top.interpolate([0, 150], [1, 0])} />
      </scene>
    )
  }
}

export default VoronoiScene
