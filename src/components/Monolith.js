import React, { Component, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { apply as applyThree, useThree, useRender } from 'react-three-fiber'
import Voronoi3D from './Voronoi3D'
import SecondScene from './SecondScene'
import ThirdScene from './ThirdScene'
import FourthScene from './FourthScene'
import Transition from '../transition/Transition'
import clock from '../util/Clock'
import midi from '../util/WebMidi'

applyThree({ Transition })

class TransitionManager {
  // scenes: [sceneRef0, sceneRef1, ...]
  constructor(scenes, transition) {
    this.scenes = scenes
    this.transition = transition
    this.currentScene = 0
  }

  update(elapsedTime) {
    const { transition, scenes } = this
    transition.update(elapsedTime)

    if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([79, 77, 76]) && this.currentScene === 0) {
      transition.setupTransition(elapsedTime)
      this.currentScene = 1
    } else if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([80, 77, 76]) && this.currentScene === 1) {
      transition.setNextScene(scenes[2], true)
      transition.setupTransition(elapsedTime)
      this.currentScene = 2
    } else if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([81, 77, 76]) && this.currentScene === 2) {
      transition.setNextScene(scenes[3], false)
      transition.setupTransition(elapsedTime)
      this.currentScene = 3
    }
  }
}

const Monolith = ({ top }) => {
  const { gl: renderer, scene, camera, size } = useThree()
  const voronoiSceneRef = useRef()
  const secondSceneRef = useRef()
  const thirdSceneRef = useRef()
  const fourthSceneRef = useRef()

  let transitionManager = null
  let transition = null

  useEffect(() => {
    const scenes = [
      voronoiSceneRef.current.sceneRef.current,
      secondSceneRef.current.sceneRef.current,
      thirdSceneRef.current.sceneRef.current,
      fourthSceneRef.current.sceneRef.current,
    ]
    transition = new Transition(camera)
    transition.initializeScenes(...scenes.slice(0, 2))
    transitionManager = new TransitionManager(scenes, transition)
  })

  useRender(() => {
    const elapsed = clock.getElapsedTime()
    transitionManager.update(elapsed)
    transition.render(renderer)
  }, true)

  return (
    <>
      <Voronoi3D top={top} size={size} ref={voronoiSceneRef} />
      <SecondScene top={top} ref={secondSceneRef} />
      <ThirdScene top={top} ref={thirdSceneRef} />
      <FourthScene top={top} ref={fourthSceneRef} />
    </>
  )
}
export default Monolith
