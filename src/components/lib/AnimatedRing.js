import React, { useEffect } from 'react'
import * as THREE from 'three/src/Three'
import { useSprings, animated } from 'react-spring/three'

const Attributes = ({ ringColors }) => {
  return () => ({
    color: ringColors[Math.round(Math.random() * (ringColors.length - 1))],
    color1: ringColors[Math.round(Math.random() * (ringColors.length - 1))],
    color2: ringColors[Math.round(Math.random() * (ringColors.length - 1))],
    opacity: THREE.Math.randFloat(0.6, 1.0),
    rotation: [0, 0, THREE.Math.degToRad(Math.round(Math.random()) * 360)],
  })
}

const AnimatedRing = ({
  numRings = 2,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  ringColors = ['#fffdfd', '#e8e3e2', '#bdb6b4', '#978D8A', '#716460'],
}) => {
  const randomRingAttributes = Attributes({ ringColors })
  const [springs, setSprings] = useSprings(numRings, i => ({
    from: randomRingAttributes(),
    ...randomRingAttributes(),
    config: { mass: 10001, tension: 1000, friction: 500 },
  }))
  useEffect(() => void setInterval(() => setSprings(i => ({ ...randomRingAttributes() })), 5000))

  const factor = 1 / numRings

  return springs.map(({ color1, color2, rotation, opacity }, index) => {
    const newScale = scale.map(x => x * (index + 1) * factor)

    return (
      <animated.mesh key={index} position={position} scale={newScale} rotation={rotation}>
        <ringGeometry attach="geometry" args={[1, 1.5, 16, 4, 0, 3.1]} />
        <animated.meshPhongMaterial
          attach="material"
          color={index === 1 ? color2 : color1}
          opacity={opacity}
          transparent
        />
      </animated.mesh>
    )
  })
}

export { AnimatedRing }
