import React, { useRef } from 'react'
import * as THREE from 'three'
import { useRender, useThree } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import GuiOptions from '../components/Gui'
import clock from '../util/Clock'
import { VertexShader, FragmentShader, Uniforms } from '../shaders/Background'

const Background = ({ color }) => {
  const { viewport } = useThree()
  const { width, height } = viewport()

  const meshRef = useRef()

  useRender(() => {
    const { options: { colorOverride, feelsLike } } = GuiOptions
    const { current: { material } } = meshRef

    material.color.set(colorOverride ? feelsLike : color.getValue())
  })
  return (
    <mesh scale={[width, height, 1]} ref={meshRef}>
      <planeGeometry name="geometry" args={[1, 1]} />
      <anim.meshBasicMaterial name="material" depthTest={false} />
    </mesh>
  )
}

export const ShaderBackground = ({ top, scrollMax, color, fragmentShader, customUniforms, receiveShadow = false }) => {
  const { viewport } = useThree()
  const { width, height } = viewport()
  let shaderRef = useRef()
  let mesh = useRef()
  let uniforms = Object.assign({}, customUniforms, Uniforms([window.innerWidth, window.innerHeight], 0x000000))
  const fs = fragmentShader || FragmentShader

  const useShaderMaterial = false

  useRender(() => {
    if (useShaderMaterial) {
      mesh.current.material.uniforms.time.value = clock.getElapsedTime()
      const { options: { colorOverride, feelsLike, color2, color3 } } = GuiOptions
      if (colorOverride) {
        const interpolatedColor = top.interpolate([0, scrollMax * 0.5, scrollMax * 1.1], [feelsLike, color2, color3])
        mesh.current.material.uniforms.color.value = new THREE.Color(interpolatedColor.getValue())
      } else {
        mesh.current.material.uniforms.color.value = new THREE.Color(color.getValue())
      }

      // special case for fifth scene
      // need to figure out way to do this better
      if (mesh.current.material.uniforms.mixFactor) {
        mesh.current.material.uniforms.mixFactor.value = GuiOptions.options.mixPercentage
      }
    }
  })
  const material = useShaderMaterial ? (
    <anim.shaderMaterial
      name="material"
      ref={shaderRef}
      vertexShader={VertexShader}
      fragmentShader={fs}
      uniforms={uniforms}
    />
  ) : (
    <anim.meshPhongMaterial name="material" color={0xffff00} />
  )

  return (
    <mesh ref={mesh} scale={[width, height, 1.0]} receiveShadow>
      <planeBufferGeometry name="geometry" args={[1, 1]} />
      {material}
    </mesh>
  )
}

export default Background
