import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import { generateBoids } from '../util/Flocking'

const Flocking = props => {
  const scale = props.scale || [1, 1, 1]

  const groupRef = useRef()
  const boids = generateBoids(100)

  useRender(() => {
    const parent = groupRef.current
    boids.forEach(boid => boid.step(boids))
    parent.children.forEach((child, i) => {
      const newPosition = boids[i].position
      child.position.x = newPosition.x
      child.position.y = newPosition.y
      child.position.z = newPosition.z
    })
  })

  return (
    <group scale={scale} ref={groupRef}>
      {boids.map((boid, i) => {
        return (
          <mesh position={boid.position} key={i}>
            <coneGeometry args={[0.2, 0.4]} attach="geometry" />
            <meshBasicMaterial color={0xa1a1a1} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

export { Flocking }
