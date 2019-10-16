/*eslint no-unused-vars: 0 */
import React, { useRef, useEffect } from 'react'
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
import { EnvironmentMapScene } from './EnvironmentMap'
import clock from '../util/Clock'
//import midi from '../util/WebMidi'
import OrbitControls from '../util/OrbitControls'
import GuiOptions from '../components/Gui'
import Background from './Background'

//applyThree({ Transition })

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

/*
 * would be nice to have WithScene + WithTransitions,
 * but i still need to figure out how R3F interacts w/ React lifecycle
 */
const WithScene = Component => {
  return class extends React.Component {
    constructor() {
      super()
      console.log('WithScene::Ctor')
      this.sceneRef = React.createRef()
    }

    render() {
      console.log('WithScene::render', this.sceneRef)
      return (
        <scene ref={this.sceneRef}>
          <Component />
        </scene>
      )
    }
  }
}
const WithTransitions = Scenes => {
  const { gl: renderer, camera, size } = useThree()
  let transitionManager = null
  let transition = null

  useRender(() => {
    const elapsed = clock.getElapsedTime()
    transitionManager.update(elapsed)
    transition.render(renderer)
  }, true)

  return class extends React.PureComponent {
    constructor() {
      super()
      this.orbitControls = null
      this.ref = React.createRef()
      //this.refs = Scenes.map(() => React.createRef())
    }

    componentDidMount() {
      this.scenes = [this.ref.current.sceneRef.current]
      transition = new Transition(camera)
      transition.initializeScenes(...this.scenes.slice(0, 2))
      transitionManager = new TransitionManager(this.scenes, transition, true)

      this.orbitControls = new OrbitControls(camera, document.querySelector('.scroll-container'))
    }

    render() {
      const InsideMusicScene = WithScene(InsideMusic)
      console.log('Monolith::render')
      return (
        <>
          <InsideMusicScene ref={this.ref} />
        </>
      )

      //return Scenes.map((Scene, i) => <Scene ref={this.refs[i]} />)
    }
  }
}

const Monolith = ({ top }) => {
  const { gl: renderer, camera, size } = useThree()
  const insideMusicSceneRef = useRef()
  const sineFieldSceneRef = useRef()
  const waveFieldSceneRef = useRef()
  const seventhSceneRef = useRef()
  const cannonJsSceneRef = useRef()
  const environmentMapSceneRef = useRef()
  /*
  const firstSceneRef = useRef()
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
      environmentMapSceneRef.current.sceneRef.current,
      /*
      insideMusicSceneRef.current.sceneRef.current,
      sineFieldSceneRef.current.sceneRef.current,
      cannonJsSceneRef.current.sceneRef.current,
      waveFieldSceneRef.current.sceneRef.current,
      firstSceneRef.current.sceneRef.current,
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

  useRender(() => {
    const elapsed = clock.getElapsedTime()
    transitionManager.update(elapsed)
    transition.render(renderer)
  }, true)

  /*
      <InsideMusicWithBackground top={top} scrollMax={size.height * 3} ref={insideMusicSceneRef} />
      <PhyllotaxisScene top={top} size={size} ref={firstSceneRef} />
      <BoxRepeatScene top={top} size={size} ref={boxRepeatSceneRef} />
      <ThirdScene top={top} size={size} ref={thirdSceneRef} />
      <FourthScene top={top} size={size} ref={fourthSceneRef} />
      <FifthScene top={top} size={size} ref={fifthSceneRef} />
      <SeventhScene top={top} size={size} ref={seventhSceneRef} />
      <CannonJsScene ref={cannonJsSceneRef} />
      */
  return (
    <>
      <EnvironmentMapScene ref={environmentMapSceneRef} />
    </>
  )
}

export default Monolith
