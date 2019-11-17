import React, { useRef, useEffect } from 'react'
import { useRender, extend, useThree } from 'react-three-fiber'
import { apply as applySpring } from 'react-spring/three'
import { StorySegment, ScrollingStory } from './ScrollingStory'
import { getScrollableHeight } from '../../util/ScrollHelper'

import { EffectComposer } from '../../postprocessing/EffectComposer'
import { RenderPass } from '../../postprocessing/RenderPass'
import { GlitchPass } from '../../postprocessing/GlitchPass'
import { ShaderPass } from '../../postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { DrunkPass } from '../../postprocessing/DrunkPass'
import { BaseController } from '../controllers/Base'
import Background from '../Background'
import { Video } from '../Video'
import { initializeFizzyText } from '../../FizzyText/FizzyText'
import { FloatingSphereLights } from '../sound-enabled/FloatingSphereLights.js'

applySpring({ EffectComposer, RenderPass, GlitchPass, ShaderPass, DrunkPass })
extend({ EffectComposer, RenderPass, GlitchPass, ShaderPass, DrunkPass })

const Effects = React.memo(({ factor }) => {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef()

  useEffect(
    () => {
      composer.current.setSize(size.width, size.height)
    },
    [size]
  )

  useRender(() => {
    composer.current.render()
  }, true)

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" name="passes" args={[scene, camera]} />
      <shaderPass
        attachArray="passes"
        args={[FXAAShader]}
        uniforms-resolution-value={[1 / size.width, 1 / size.height]}
      />
      <DrunkPass factor={factor} shouldRenderToScreen={true} />
    </effectComposer>
  )
})

class GrandfatherStory extends BaseController {
  constructor() {
    super()
    initializeFizzyText()
  }

  render() {
    const { top } = this.props
    const scrollMax = getScrollableHeight()
    const BackgroundComponent = (
      <Background
        color={top.interpolate(
          [0, scrollMax * 0.25, scrollMax * 0.33, scrollMax * 0.5, scrollMax],
          ['#e82968', '#e0c919', '#504006', '#e32f01', '#333333']
        )}
      />
    )
    return (
      <scene ref={this.sceneRef}>
        <ScrollingStory top={top} BackgroundComponent={BackgroundComponent}>
          <StorySegment>
            <Video domElementId="brandy_eve_allen_1" dimensions={[4, 4]} rotation={[0, 0, 0]} position={[0, 0, 0]} />
            <FloatingSphereLights boxDimensions={[6, 36, 6]} />
          </StorySegment>
          <StorySegment>
            <Video
              domElementId="brandy_eve_allen_2"
              dimensions={[3, 3]}
              rotation={[0, -Math.PI * 0.25, 0]}
              position={[0, 0, 0]}
            />
          </StorySegment>
          <StorySegment>
            <Video domElementId="brandy_eve_allen_3" dimensions={[3.5, 3.5]} position={[0.25, -0.25, 0]} />
          </StorySegment>
          <StorySegment>
            <Video domElementId="brandy_eve_allen_4" dimensions={[4, 4]} />
          </StorySegment>
        </ScrollingStory>
        <Effects factor={top.interpolate([0, 150], [0.8, 0.7])} />
      </scene>
    )
  }
}

export { GrandfatherStory }
