import React, { useRef, useEffect } from 'react'
import { extend as applyThree, useThree, useRender } from 'react-three-fiber'
import PhyllotaxisScene from './PhyllotaxisScene'
import SineFieldScene from './SineFieldScene'
import BoxRepeatScene from './BoxRepeatScene'
import ThirdScene from './ThirdScene'
import FourthScene from './FourthScene'
import FifthScene from './FifthScene'
import SixthScene from './SixthScene'
import SeventhScene from './SeventhScene'
import WaveFieldScene from './WaveFieldScene'
import LiveScene from './LiveScene'
import Transition from '../transition/Transition'
import clock from '../util/Clock'
//import midi from '../util/WebMidi'
import OrbitControls from '../util/OrbitControls'
import GuiOptions from '../components/Gui'

applyThree({ Transition })

class TransitionManager {
  // scenes: [sceneRef0, sceneRef1, ...]
  constructor(scenes, transition, datGuiOverride) {
    this.scenes = scenes
    this.transition = transition
    this.datGuiOverride = datGuiOverride
    this.currentScene = 0
    this.numTimesTransitioned = 0
  }

  update(elapsedTime) {
    const { datGuiOverride, transition, scenes, currentScene, numTimesTransitioned } = this
    transition.update(elapsedTime)
    const { options: { currentScene: nextScene } } = GuiOptions

    if (datGuiOverride && currentScene !== nextScene && nextScene < this.scenes.length) {
      transition.setNextScene(scenes[nextScene], numTimesTransitioned % 2 !== 0)
      transition.setupTransition(elapsedTime)
      this.currentScene = nextScene
      this.numTimesTransitioned++
      return
    }

    /*
    if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([79, 77, 76]) && this.currentScene === 0) {
      transition.setupTransition(elapsedTime)
      this.currentScene = 1
      this.numTimesTransitioned++
    } else if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([80, 77, 76]) && this.currentScene === 1) {
      transition.setNextScene(scenes[2], true)
      transition.setupTransition(elapsedTime)
      this.currentScene = 2
      this.numTimesTransitioned++
    } else if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([81, 77, 76]) && this.currentScene === 2) {
      transition.setNextScene(scenes[3], false)
      transition.setupTransition(elapsedTime)
      this.currentScene = 3
      this.numTimesTransitioned++
    }
    */
  }
}

const Monolith = ({ top }) => {
  console.log('src/components/Monolith.js constructor')
  console.log(top)
  const { gl: renderer, camera, size } = useThree()
  /*
  const firstSceneRef = useRef()
  const sineFieldSceneRef = useRef()
  const boxRepeatSceneRef = useRef()
  const thirdSceneRef = useRef()
  const fourthSceneRef = useRef()
  const fifthSceneRef = useRef()
  const sixthSceneRef = useRef()
  const seventhSceneRef = useRef()
  const waveFieldSceneRef = useRef()
  */
  const liveSceneRef = useRef()

  let transitionManager = null
  let transition = null

  useEffect(() => {
    const scenes = [
      liveSceneRef.current.sceneRef.current,
      /*
      waveFieldSceneRef.current.sceneRef.current,
      firstSceneRef.current.sceneRef.current,
      sineFieldSceneRef.current.sceneRef.current,
      boxRepeatSceneRef.current.sceneRef.current,
      thirdSceneRef.current.sceneRef.current,
      fourthSceneRef.current.sceneRef.current,
      fifthSceneRef.current.sceneRef.current,
      sixthSceneRef.current.sceneRef.current,
      seventhSceneRef.current.sceneRef.current,
      */
    ]
    transition = new Transition(camera)
    transition.initializeScenes(...scenes.slice(0, 2))
    transitionManager = new TransitionManager(scenes, transition, true)

    new OrbitControls(camera, document.querySelector('.scroll-container'))
  })

  useRender(() => {
    const elapsed = clock.getElapsedTime()
    transitionManager.update(elapsed)
    transition.render(renderer)
  }, true)

  /*
      <PhyllotaxisScene top={top} size={size} ref={firstSceneRef} />
      <SineFieldScene top={top} size={size} ref={sineFieldSceneRef} />
      <BoxRepeatScene top={top} size={size} ref={boxRepeatSceneRef} />
      <ThirdScene top={top} size={size} ref={thirdSceneRef} />
      <FourthScene top={top} size={size} ref={fourthSceneRef} />
      <FifthScene top={top} size={size} ref={fifthSceneRef} />
      <SixthScene top={top} size={size} ref={sixthSceneRef} />
      <SeventhScene top={top} size={size} ref={seventhSceneRef} />
      <WaveFieldScene top={top} size={size} ref={waveFieldSceneRef} />
      */
  return (
    <>
      <LiveScene top={top} size={size} ref={liveSceneRef} />
    </>
  )
}
export default Monolith
