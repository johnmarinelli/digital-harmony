import React, { Component, useRef } from 'react'
import * as THREE from 'three'
import { apply as applyThree, useThree, useRender } from 'react-three-fiber'
import Voronoi3D from './Voronoi3D'
import SecondScene from './SecondScene'
import Transition from '../transition/Transition'
import { apply as applySpring, useSpring, animated as anim } from 'react-spring/three'

applyThree({ Transition })

const Monolith = ({ top }) => {
  const { gl: renderer, scene, camera, size } = useThree()
  const voronoiSceneRef = useRef()
  const secondSceneRef = useRef()
  const transitionRef = useRef()

  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false,
  }

  const voronoiSceneFbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)
  const secondSceneFbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)
  const transition = new Transition()
  transition.setActiveCamera(camera)
  useRender(() => {
    if (voronoiSceneRef.current.sceneRef && secondSceneRef.current.sceneRef) {
      /*
      renderer.clear()
      renderer.setRenderTarget(voronoiSceneFbo)
      renderer.render(voronoiSceneRef.current.sceneRef.current, camera)
      renderer.clear()
      renderer.setRenderTarget(secondSceneFbo)
      renderer.render(secondSceneRef.current.sceneRef.current, camera)
      */
      if (transition.sceneA === null && transition.sceneB === null) {
        transition.initializeScenes(voronoiSceneRef.current.sceneRef.current, secondSceneRef.current.sceneRef.current)
      }

      transition.render(renderer)
    } else {
      renderer.render(scene, camera)
    }
    /*
    renderer.clear()
    renderer.setRenderTarget(null)
    renderer.render(secondSceneRef.current.sceneRef.current, camera)
    */
  }, true)

  const voronoiScene = <Voronoi3D top={top} size={size} ref={voronoiSceneRef} onSceneLoaded={() => {}} />
  const secondScene = <SecondScene top={top} ref={secondSceneRef} onSceneLoaded={() => {}} />
  return (
    <>
      {voronoiScene}
      {secondScene}
    </>
  )
}
export default Monolith
