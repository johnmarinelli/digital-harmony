import React, { useRef } from 'react'
import * as THREE from 'three/src/Three'
import TransitionShader from '../shaders/Transition'
import clock from '../util/Clock'
import { animated as anim } from 'react-spring/three'
import { Pass } from '../postprocessing/Pass'

const Transition = function(camera) {
  this.transitionParams = {
    useTexture: true,
    transition: 1.0,
    transitionSpeed: 2.0,
    texture: 5,
    loopTexture: true,
    textureThreshold: 0.3,
  }

  this.scene = new THREE.Scene()
  this.sceneA = null
  this.sceneB = null
  this.cameraOrtho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  this.textures = []
  for (let i = 0; i < 6; i++) {
    this.textures[i] = new THREE.TextureLoader().load('/textures/transition/transition' + (i + 1) + '.png')
  }

  this.material = new THREE.ShaderMaterial({
    ...TransitionShader(this.textures[0]),
  })

  this.quad = new THREE.PlaneGeometry(2, 2)

  this.quad = new THREE.Mesh(this.quad, this.material)
  this.scene.add(this.quad)

  this.material.uniforms.tDiffuse1.value = null
  this.material.uniforms.tDiffuse2.value = null

  this.needChange = false

  this.setTextureThreshold = function(value) {
    this.material.uniforms.threshold.value = value
  }

  this.useTexture = function(value) {
    this.material.uniforms.useTexture.value = value ? 1 : 0
  }

  this.setTexture = function(i) {
    this.material.uniforms.tMixTexture.value = this.textures[i]
  }

  this.initializeScenes = function(sceneA, sceneB) {
    const renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false,
    }
    this.sceneA = sceneA
    this.sceneB = sceneB
    this.sceneAFbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)
    this.sceneBFbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)
    this.material.uniforms.tDiffuse1.value = this.sceneAFbo
    this.material.uniforms.tDiffuse2.value = this.sceneBFbo
  }

  this.activeCamera = camera
  //this.numTimesTransitioned = 0
  //this.currentScene = -1
  this.shouldTransition = false
  this.transitionStartedAt = 0.0
  this.lastScene = 'a'
}

Transition.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: Transition,

  setupTransition(startedAt) {
    this.shouldTransition = true
    this.transitionStartedAt = startedAt
  },

  finishTransition() {
    this.shouldTransition = false
  },

  update(elapsedTime) {
    // Transition animation
    const { transitionParams } = this

    if (this.shouldTransition) {
      const delta = elapsedTime - this.transitionStartedAt
      //let t = (1 + Math.sin(transitionParams.transitionSpeed * delta / Math.PI)) / 2
      //transitionParams.transition = THREE.Math.smoothstep(t, transitionParams.textureThreshold, 0.7)
      let t = Math.sin(transitionParams.transitionSpeed * delta / Math.PI)
      const transitionFactor = THREE.Math.smoothstep(t, transitionParams.textureThreshold, 0.7)
      transitionParams.transition = this.lastScene === 'a' ? 1.0 - transitionFactor : transitionFactor
      console.log(transitionParams.transition)

      // controls switching transition textures
      if (transitionParams.loopTexture && (transitionParams.transition === 0 || transitionParams.transition === 1)) {
        if (this.needChange) {
          transitionParams.texture = (transitionParams.texture + 1) % this.textures.length
          this.material.uniforms.tMixTexture.value = this.textures[transitionParams.texture]
          this.needChange = false
          //this.numTimesTransitioned++
          this.finishTransition()
        }
      } else this.needChange = true
      this.material.uniforms.mixRatio.value = transitionParams.transition
    }
  },

  render: function(renderer) {
    const { transitionParams } = this
    // Prevent render both scenes when it's not necessary
    if (transitionParams.transition === 0) {
      this.lastScene = 'b'
      renderer.render(this.sceneB, this.activeCamera)
    } else if (transitionParams.transition === 1) {
      this.lastScene = 'a'
      renderer.render(this.sceneA, this.activeCamera)
    } else {
      // When 0<transition<1 render transition between two scenes
      // second parameter: "renderToTexture"
      // if true, `sceneA` will render to fbo
      renderer.clear()
      renderer.setRenderTarget(this.sceneAFbo)
      renderer.render(this.sceneA, this.activeCamera)
      renderer.setRenderTarget(this.sceneBFbo)
      renderer.render(this.sceneB, this.activeCamera)
      renderer.setRenderTarget(null)
      renderer.render(this.scene, this.cameraOrtho)
    }
  },

  setActiveCamera: function(camera) {
    this.activeCamera = camera
  },

  setNextScene: function(scene, isSceneA) {
    // should do some kind of cleanup for old scenes

    if (isSceneA) {
      this.sceneA = scene
    } else {
      this.sceneB = scene
    }
  },
})

export default Transition
