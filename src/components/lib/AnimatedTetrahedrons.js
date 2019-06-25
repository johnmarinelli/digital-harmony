import React, { useEffect } from 'react'
import * as THREE from 'three/src/Three'
import { useSprings, animated } from 'react-spring/three'

const colors = ['#441151', '#883677', '#CA61C3', '#EE85B5', '#FF958C']

const random = () => {
  return {
    color: colors[Math.round(Math.random() * (colors.length - 1))],
    rotation: [0, 0, THREE.Math.degToRad(Math.round(Math.random()) * 45)],
  }
}

const AnimatedTetrahedrons = ({ numRows = 3, numCols = 3, scale = [1, 1, 1] }) => {
  const [springs, set] = useSprings(numRows * numCols, i => ({
    from: random(),
    ...random(),
    config: { mass: 20, tension: 500, friction: 200 },
  }))
  useEffect(() => void setInterval(() => set(i => ({ ...random(), delay: i * 50 })), 2000), [])

  let tetrahedrons = new Array(numRows * numCols)

  for (let i = 0; i < numCols; ++i) {
    for (let j = 0; j < numRows; ++j) {
      const index = i * numCols + j
      const spring = springs[index]
      const { rotation, color } = spring
      const element = (
        <animated.mesh key={index} position={[i, j, 0.0]} rotation={rotation} scale={[0.5, 0.5, 0.5]}>
          <tetrahedronGeometry attach="geometry" />
          <animated.meshPhongMaterial attach="material" color={color} />
        </animated.mesh>
      )
      tetrahedrons[index] = element
    }
  }
  return <animated.group scale={scale}>{tetrahedrons}</animated.group>
}

export default AnimatedTetrahedrons
