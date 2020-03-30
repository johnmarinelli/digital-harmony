import React, { useRef } from 'react'
import * as THREE from 'three'
import { useRender, useThree } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import GuiOptions from '../components/Gui'
import clock from '../util/Clock'
import { VertexShader, FragmentShader, Uniforms } from '../shaders/Background'

/* example:
  <Background
    color={top.interpolate(
      [0, scrollMax * 0.25, scrollMax * 0.33, scrollMax * 0.5, scrollMax],
      ['#e82968', '#e0c919', '#504006', '#e32f01', '#333333']
    )}
  />
*/
const Background = ({ color, receiveShadow = false, depthTest = false }) => {
  const { gl, viewport } = useThree()
  const { width, height } = viewport

  if (receiveShadow) {
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
  }
  const meshRef = useRef()

  useRender(() => {
    const {
      options: { colorOverride, feelsLike },
    } = GuiOptions
    const {
      current: { material },
    } = meshRef

    material.color.set(colorOverride ? feelsLike : color)
  })
  return (
    <mesh position={[0, 0, -5]} scale={[width * 10, height * 10, 1]} ref={meshRef}>
      <planeGeometry attach="geometry" args={[1, 1]} />
      <anim.meshBasicMaterial color={color} attach="material" depthTest={depthTest} receiveShadow={receiveShadow} />
    </mesh>
  )
}

/*
 *
 * example:
 * <ShaderBackground
 *     top={top}
 *     scrollMax={scrollMax}
 *     color={top.interpolate([0, scrollMax * 0.25], ['#B27193', '#AE709E'])}
 *     fragmentShader={FragmentShader}
 *     customUniforms={Uniforms()}
 * />
 */
export const ShaderBackground = ({
  top,
  scrollMax,
  color,
  vertexShader,
  fragmentShader,
  customUniforms,
  receiveShadow = false,
}) => {
  const { viewport } = useThree()
  const { width, height } = viewport
  let mesh = useRef()
  let uniforms = Object.assign({}, customUniforms, Uniforms([window.innerWidth, window.innerHeight], 0x000000))
  const fs = fragmentShader || FragmentShader
  const vs = vertexShader || VertexShader

  useRender(() => {
    mesh.current.material.uniforms.time.value = clock.getElapsedTime()
    /*
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
    */
  })
  const material = <shaderMaterial attach="material" vertexShader={vs} fragmentShader={fs} uniforms={uniforms} />

  return (
    <mesh position={[0, 0, -5]} ref={mesh} scale={[width * 3, height * 3, 1]} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[1, 1]} />
      {material}
    </mesh>
  )
}

export default Background
