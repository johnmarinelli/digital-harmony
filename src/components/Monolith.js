/*eslint no-unused-vars: 0 */
import React, { useRef, useEffect, useMemo, useState } from 'react'
import { useSpring } from 'react-spring/three'
import { extend as applyThree, useThree, useRender } from 'react-three-fiber'
import { PhyllotaxisWithScrollingBackground } from './PhyllotaxisScene'
import SineFieldScene from './SineFieldScene'
import { BoxRepeatScene } from './BoxRepeatScene'
import LissajousKnotScene from './LissajousKnotScene'
import DigitalHarmonyScene from './DigitalHarmonyScene'
import { CannonJsScene } from './CannonJsScene'
import { VideoExampleScene } from './VideoExampleScene'
import { WaveFieldScene } from './WaveFieldScene'
import { InsideMusic, InsideMusicWithBackground } from './InsideMusic'
import Transition from '../transition/Transition'
import { EnvironmentMapScene, EnvironmentMap } from './EnvironmentMap'
import clock from '../util/Clock'
//import midi from '../util/WebMidi'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Background from './Background'
import { TransitionManager } from '../transition/TransitionManager'
import { FirstStory } from './stories/FirstStory'
import { VoronoiScene } from './Voronoi3D'

//applyThree({ Transition })
const Monolith = ({ top }) => {
  const { gl: renderer, camera, size } = useThree()
  const insideMusicSceneRef = useRef()
  const sineFieldSceneRef = useRef()
  const waveFieldSceneRef = useRef()
  const videoExampleSceneRef = useRef()
  const cannonJsSceneRef = useRef()
  const environmentMapSceneRef = useRef()
  const phyllotaxisSceneRef = useRef()
  const fourthSceneRef = useRef()
  const scrollingStoryRef = useRef()
  const lissajousKnotSceneRef = useRef()
  const boxRepeatSceneRef = useRef()
  const voronoiSceneRef = useRef()

  let transitionManager = null
  let transition = null
  let hasBeenInitialized = false

  useEffect(
    () => {
      const scenes = [
        scrollingStoryRef.current.sceneRef.current,
        /*
        fourthSceneRef.current.sceneRef.current,
        waveFieldSceneRef.current.sceneRef.current,
        voronoiSceneRef.current.sceneRef.current,
        insideMusicSceneRef.current.sceneRef.current,
        boxRepeatSceneRef.current.sceneRef.current,
        phyllotaxisSceneRef,
        lissajousKnotSceneRef.current.sceneRef.current,
      videoExampleSceneRef.current.sceneRef.current,
      phyllotaxisSceneRef.current.sceneRef.current,
      environmentMapSceneRef.current.sceneRef.current,
      sineFieldSceneRef.current.sceneRef.current,
      cannonJsSceneRef.current.sceneRef.current,
      */
      ]
      if (!hasBeenInitialized) {
        transition = new Transition(camera)
        transition.initializeScenes(...scenes.slice(0, 2))
        transitionManager = new TransitionManager(scenes, transition, true)
        hasBeenInitialized = true
      }

      const controls = new OrbitControls(camera, document.querySelector('.scroll-container'))
      controls.enableZoom = false
      controls.update()
    },
    [hasBeenInitialized]
  )

  /*
  useRender(() => {
    const elapsed = clock.getElapsedTime()
    transitionManager.update(elapsed)
    transition.render(renderer)
  }, true)
  */

  /*

      <DigitalHarmonyScene top={top} size={size} ref={fourthSceneRef} />
      <VideoExampleScene top={top} size={size} ref={videoExampleSceneRef} />
      <CannonJsScene ref={cannonJsSceneRef} />
      <LissajousKnotScene top={top} size={size} ref={lissajousKnotSceneRef} />
      <PhyllotaxisWithScrollingBackground top={top} scrollMax={size.height * 5} ref={phyllotaxisSceneRef} />
      <BoxRepeatScene top={top} size={size} ref={boxRepeatSceneRef} />
      <InsideMusicWithBackground top={top} scrollMax={size.height * 3} ref={insideMusicSceneRef} />
  return (
    <>
      <EnvironmentMapScene ref={environmentMapSceneRef} />
    </>
  )
      */

  /*
   * automate the scroll
  const [{ top }, set] = useSpring(() => ({ top: 0 }))
  useRender(() => {
    set({ top: top.getValue() + 10 })
  })
  */
  return <FirstStory renderer={renderer} top={top} ref={scrollingStoryRef} />
}

export default Monolith
