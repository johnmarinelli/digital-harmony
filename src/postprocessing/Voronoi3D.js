import React, { useRef } from 'react'
import { useRender, useThree } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import * as THREE from 'three/src/Three'
import { Pass } from './Pass.js'
import { VertexShader, FragmentShader, Uniforms } from '../shaders/Voronoi3D'
import GuiOptions from '../components/Gui'

// use as <anim.voronoi3DPass />
let Voronoi3DPass = function(clock) {
  Pass.call(this)
  const initialColor = GuiOptions.options.feelsLike
  const resolution = [window.innerWidth, window.innerHeight]
  this.elapsed = 0.0
  this.uniforms = Uniforms(resolution, parseInt(initialColor, 16))
  this.material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
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

/*
 * this is the one being used - 29/03/2019
 */
const Voronoi3D = ({ clock, segments, colorPalette, top, voronoiScale, datGuiOverride = false }) => {
  const { viewport } = useThree()
  const { width, height } = viewport()
  let shaderRef = useRef()
  let mesh = useRef()
  let color = colorPalette[0]
  let uniforms = Uniforms([window.innerWidth, window.innerHeight], parseInt(color.slice(1, 7), 16))

  useRender(() => {
    mesh.current.material.uniforms.time.value = clock.getElapsedTime()
    mesh.current.material.uniforms.scale.value = voronoiScale.getValue()
    if (datGuiOverride) {
      mesh.current.material.uniforms.color.value = new THREE.Color(
        new THREE.Color(parseInt(GuiOptions.options.feelsLike.slice(1, 7), 16))
      )
      //mesh.current.material.uniforms.scale.value = GuiOptions.options.voronoi3DScale
    } else {
      const calculatedColor = top.interpolate(segments, colorPalette)
      mesh.current.material.uniforms.color.value = new THREE.Color(calculatedColor.getValue())
    }
  })

  return (
    <mesh ref={mesh} scale={[width, height, 1.0]}>
      <planeGeometry name="geometry" args={[1, 1]} />
      <anim.shaderMaterial
        name="material"
        ref={shaderRef}
        color={color}
        depthTest={false}
        vertexShader={VertexShader}
        fragmentShader={FragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export { Voronoi3DPass, Voronoi3D }
