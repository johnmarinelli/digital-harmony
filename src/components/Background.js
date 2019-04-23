import React, { useRef } from 'react'
import { useRender, useThree } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import GuiOptions from '../components/Gui'

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

export default Background
