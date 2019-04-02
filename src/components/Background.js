import React, { useMemo, useRef, useState } from 'react'
import { useRender, useThree } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'

const Background = ({ color }) => {
  const { viewport } = useThree()
  const { width, height } = viewport()
  return (
    <mesh scale={[width, height, 1]}>
      <planeGeometry name="geometry" args={[1, 1]} />
      <anim.meshBasicMaterial name="material" color={color} depthTest={false} />
    </mesh>
  )
}

export default Background
