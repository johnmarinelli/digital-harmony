import React, { useRef } from 'react'
import { useRender, useThree } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import * as THREE from 'three/src/Three'
/*
import Voronoi3DVertex from '../shaders/Voronoi3D.vert.js'
import Voronoi3DShader from '../shaders/Voronoi3D.frag.js'
*/
import { Pass } from './Pass.js'
import Voronoi3DShader from '../shaders/Voronoi3D'
import GuiOptions from '../components/Gui'

// use as <anim.voronoi3DPass />
let Voronoi3DPass = function(clock) {
  Pass.call(this)
  const shader = Voronoi3DShader([window.innerWidth, window.innerHeight], GuiOptions.options.feelsLike)
  this.elapsed = 0.0
  this.uniforms = THREE.UniformsUtils.clone(shader.uniforms)
  this.material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
  })
  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  this.scene = new THREE.Scene()
  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null)
  this.quad.frustumCulled = false
  this.scene.add(this.quad)
  this.factor = 0
}

Voronoi3DPass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: Voronoi3DPass,
  render: function(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    const factor = Math.max(0, this.factor)
    this.uniforms.time.value = this.elapsed
    this.uniforms.scale.value = GuiOptions.options.voronoi3DScale
    this.uniforms.color.value = new THREE.Color(new THREE.Color(parseInt(GuiOptions.options.feelsLike.slice(1, 7), 16)))

    this.quad.material = this.material
    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      renderer.render(this.scene, this.camera)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      renderer.render(this.scene, this.camera)
    }
    this.elapsed += deltaTime
  },
})

const Voronoi3D = ({ clock, color, voronoiScale }) => {
  const { viewport } = useThree()
  const { width, height } = viewport()
  let shaderRef = useRef()
  let mesh = useRef()
  let uniforms = {
    resolution: {
      type: 'v2',
      value: [window.innerWidth, window.innerHeight],
    },
    time: { type: 'f', value: 0 },
    scale: { type: 'f', value: 10.0 },
    color: { value: new THREE.Color(parseInt(color, 16)) },
  }

  const shader = Voronoi3DShader([window.innerWidth, window.innerHeight], color)

  useRender(() => {
    mesh.current.material.uniforms.time.value = clock.getElapsedTime()
    mesh.current.material.uniforms.scale.value = voronoiScale.getValue()
    //mesh.current.material.uniforms.scale.value = GuiOptions.options.voronoi3DScale
    mesh.current.material.uniforms.color.value = new THREE.Color(color.getValue())
    /*
    mesh.current.material.uniforms.color.value = new THREE.Color(
      new THREE.Color(parseInt(GuiOptions.options.feelsLike.slice(1, 7), 16))
    )
    */
  })

  return (
    <mesh ref={mesh} scale={[width, height, 1.0]}>
      <planeGeometry name="geometry" args={[1, 1]} />
      <anim.shaderMaterial
        name="material"
        ref={shaderRef}
        color={color}
        depthTest={false}
        vertexShader={shader.vertexShader}
        fragmentShader={shader.fragmentShader}
        uniforms={shader.uniforms}
      />
    </mesh>
  )
}

export { Voronoi3DPass, Voronoi3D }
