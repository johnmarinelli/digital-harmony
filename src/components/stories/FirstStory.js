import React, { useRef, useEffect } from 'react'
import { useRender, extend, useThree } from 'react-three-fiber'
import { animated, apply as applySpring } from 'react-spring/three'
import { StorySegment, ScrollingStory } from './ScrollingStory'
import { FiftyNote } from '../models/UkCurrency'
import { EnvironmentMap } from '../EnvironmentMap'
import { loadHDREnvironmentMap, loadEnvironmentMapUrls } from '../../util/Loaders'

import { withSong } from '../420/WithSong'
import { Rings } from '../sound-enabled/Rings'

import { EffectComposer } from '../../postprocessing/EffectComposer'
import { RenderPass } from '../../postprocessing/RenderPass'
import { GlitchPass } from '../../postprocessing/GlitchPass'
import { ShaderPass } from '../../postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { DrunkPass } from '../../postprocessing/DrunkPass'
import { Video } from '../Video'

import { EnvironmentMapHDR } from '../EnvironmentMapHDR'

applySpring({ EffectComposer, RenderPass, GlitchPass, ShaderPass, DrunkPass, EnvironmentMapHDR })
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

class FirstStory extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()

    const ringComponents = [
      <Rings amplitude={1} name="battery" position={[-2, 0, 2]} rotateX={Math.PI * -0.5} waveformResolution={5} />,
      <Rings
        amplitude={2}
        name="guitar"
        position={[2, 2, -2]}
        waveformResolution={16}
        rotate-y={Math.PI * 0.5}
        size={18}
        hue={0.7}
      />,
    ]

    const Song = withSong(ringComponents, 'take_me_out', 3)
    extend({ Song })
    this.Song = <Song />
  }

  render() {
    const { top, renderer } = this.props
    const cubeTexture = loadEnvironmentMapUrls('daylight-bridge', [
      'posx.jpg',
      'negx.jpg',
      'posy.jpg',
      'negy.jpg',
      'posz.jpg',
      'negz.jpg',
    ])
    const pisaCubeTexture = loadEnvironmentMapUrls('pisa', ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
    const hdrEnvMap = loadHDREnvironmentMap(
      'pisa-hdr',
      ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'],
      renderer
    )
    return (
      <scene ref={this.sceneRef}>
        <ScrollingStory top={top}>
          <StorySegment>
            {this.Song}
            <FiftyNote />
            <Video domElementId="kris_drinking" dimensions={[2, 2]} />
          </StorySegment>
          <StorySegment>
            <EnvironmentMapHDR
              factor={top.interpolate([0, 1000], [0, 1])}
              hdrEnvMap={hdrEnvMap}
              envMap={pisaCubeTexture}
            />
          </StorySegment>
          <StorySegment>
            <EnvironmentMap cubeTexture={cubeTexture} />
          </StorySegment>
          <StorySegment>
            <mesh>
              <cubeGeometry attach="geometry" />
            </mesh>
          </StorySegment>
          <StorySegment>
            <mesh>
              <cubeGeometry attach="geometry" />
            </mesh>
          </StorySegment>
        </ScrollingStory>
        <Effects factor={top.interpolate([0, 150], [0.8, 0.7])} />
      </scene>
    )
  }
}

export { FirstStory }
