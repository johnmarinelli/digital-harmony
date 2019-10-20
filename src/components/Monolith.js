/*eslint no-unused-vars: 0 */
import React, { useRef, useEffect, useMemo, useState } from 'react'
import { extend as applyThree, useThree, useRender } from 'react-three-fiber'
import PhyllotaxisScene from './PhyllotaxisScene'
import SineFieldScene from './SineFieldScene'
import BoxRepeatScene from './BoxRepeatScene'
import ThirdScene from './ThirdScene'
import FourthScene from './FourthScene'
import FifthScene from './FifthScene'
import { CannonJsScene } from './CannonJsScene'
import SeventhScene from './SeventhScene'
import WaveFieldScene from './WaveFieldScene'
import { InsideMusic, InsideMusicWithBackground } from './InsideMusic'
import Transition from '../transition/Transition'
import { EnvironmentMapScene, EnvironmentMap } from './EnvironmentMap'
import clock from '../util/Clock'
//import midi from '../util/WebMidi'
import OrbitControls from '../util/OrbitControls'
import Background from './Background'
import { TransitionManager } from '../transition/TransitionManager'
import { FirstStory } from './stories/FirstStory'

//applyThree({ Transition })
const Monolith = ({ top }) => {
  const { gl: renderer, camera, size } = useThree()
  const insideMusicSceneRef = useRef()
  const sineFieldSceneRef = useRef()
  const waveFieldSceneRef = useRef()
  const seventhSceneRef = useRef()
  const cannonJsSceneRef = useRef()
  const environmentMapSceneRef = useRef()
  const firstSceneRef = useRef()
  const scrollingStoryRef = useRef()
  /*
  const boxRepeatSceneRef = useRef()
  const thirdSceneRef = useRef()
  const fourthSceneRef = useRef()
  const fifthSceneRef = useRef()
  */

  let transitionManager = null
  let transition = null
  let hasBeenInitialized = false

  useEffect(() => {
    const scenes = [
      scrollingStoryRef.current.sceneRef.current,
      /*
      firstSceneRef.current.sceneRef.current,
      environmentMapSceneRef.current.sceneRef.current,
      insideMusicSceneRef.current.sceneRef.current,
      sineFieldSceneRef.current.sceneRef.current,
      cannonJsSceneRef.current.sceneRef.current,
      waveFieldSceneRef.current.sceneRef.current,
      boxRepeatSceneRef.current.sceneRef.current,
      thirdSceneRef.current.sceneRef.current,
      fourthSceneRef.current.sceneRef.current,
      fifthSceneRef.current.sceneRef.current,
      seventhSceneRef.current.sceneRef.current,
      */
    ]
    if (!hasBeenInitialized) {
      console.log('Initializing Transition Manager')
      transition = new Transition(camera)
      transition.initializeScenes(...scenes.slice(0, 2))
      transitionManager = new TransitionManager(scenes, transition, true)
      hasBeenInitialized = true
    }

    new OrbitControls(camera, document.querySelector('.scroll-container'))
  }, hasBeenInitialized)

  /*
  useRender(() => {
    const elapsed = clock.getElapsedTime()
    transitionManager.update(elapsed)
    transition.render(renderer)
  }, true)
  */

  /*
      <InsideMusicWithBackground top={top} scrollMax={size.height * 3} ref={insideMusicSceneRef} />
      <PhyllotaxisScene top={top} size={size} ref={firstSceneRef} />
      <BoxRepeatScene top={top} size={size} ref={boxRepeatSceneRef} />
      <ThirdScene top={top} size={size} ref={thirdSceneRef} />
      <FourthScene top={top} size={size} ref={fourthSceneRef} />
      <FifthScene top={top} size={size} ref={fifthSceneRef} />
      <SeventhScene top={top} size={size} ref={seventhSceneRef} />
      <CannonJsScene ref={cannonJsSceneRef} />
  return (
    <>
      <EnvironmentMapScene ref={environmentMapSceneRef} />
    </>
  )
      */
  return <FirstStory top={top} ref={scrollingStoryRef} />
}

export default Monolith
