import React, { useRef } from 'react'
import * as THREE from 'three/src/Three'
import TransitionShader from '../shaders/Transition'
import clock from '../util/Clock'
import { animated as anim } from 'react-spring/three'
import { Pass } from '../postprocessing/Pass'

var transitionParams = {
  useTexture: true,
  transition: 0.5,
  transitionSpeed: 2.0,
  texture: 5,
  loopTexture: true,
  animateTransition: true,
  textureThreshold: 0.3,
}

function Transition() {
  this.scene = new THREE.Scene()
  this.sceneA = null
  this.sceneB = null
  this.cameraOrtho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  this.textures = []
  for (var i = 0; i < 6; i++) {
    this.textures[i] = new THREE.TextureLoader().load('/textures/transition/transition' + (i + 1) + '.png')
  }

  this.material = new THREE.ShaderMaterial({
    ...TransitionShader(this.textures[0]),
  })

  this.quad = new THREE.PlaneGeometry(2, 2)

  this.quad = new THREE.Mesh(this.quad, this.material)
  this.scene.add(this.quad)

  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false,
  }

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
    this.sceneA = sceneA
    this.sceneB = sceneB
    this.sceneAFbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)
    this.sceneBFbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)
    this.material.uniforms.tDiffuse1.value = this.sceneAFbo
    this.material.uniforms.tDiffuse2.value = this.sceneBFbo
  }
}

Transition.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: Transition,

  render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
    // Transition animation
    if (transitionParams.animateTransition) {
      var t = (1 + Math.sin(transitionParams.transitionSpeed * clock.getElapsedTime() / Math.PI)) / 2
      transitionParams.transition = THREE.Math.smoothstep(t, 0.3, 0.7)

      // Change the current alpha texture after each transition
      if (transitionParams.loopTexture && (transitionParams.transition === 0 || transitionParams.transition === 1)) {
        if (this.needChange) {
          transitionParams.texture = (transitionParams.texture + 1) % this.textures.length
          this.material.uniforms.tMixTexture.value = this.textures[transitionParams.texture]
          this.needChange = false
        }
      } else this.needChange = true
    }

    this.material.uniforms.mixRatio.value = transitionParams.transition

    // Prevent render both scenes when it's not necessary
    if (transitionParams.transition === 0) {
      //this.sceneB.render(delta, false)
      renderer.render(this.sceneB, this.activeCamera)
    } else if (transitionParams.transition === 1) {
      //this.sceneA.render(delta, false)
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
      renderer.clear()
      renderer.setRenderTarget(null)
      renderer.render(this.scene, this.cameraOrtho)
    }
  },

  setActiveCamera: function(camera) {
    this.activeCamera = camera
  },
})

export default Transition
