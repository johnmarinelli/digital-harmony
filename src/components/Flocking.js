import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import { generateBoids } from '../util/Flocking'
import clock from '../util/Clock'
import GuiOptions from './Gui'
import midi from '../util/WebMidi'
import { lead } from './signal-generators/lead'

const Flocking = props => {
  const scale = props.scale || [1, 1, 1]
  const position = props.position || [0, 0, 0]
  const rotateX = props.rotateX || 0

  const groupRef = useRef()
  const boids = generateBoids(100)
  const { signal, triggerFn } = lead()
  midi.addAbletonListener('noteon', triggerFn, 4, 'LeadListener')

  useRender(() => {
    const parent = groupRef.current
    const t = clock.getElapsedTime()
    boids.forEach(boid => boid.step(boids))
    parent.children.forEach((child, i) => {
      const newPosition = boids[i].position
      child.position.x = newPosition.x
      child.position.y = newPosition.y
      child.position.z = newPosition.z

      child.material.color.g = 1 - signal.value
      child.material.color.b = 1 - signal.value
      child.material.opacity = Math.max(0.3, signal.value)
    })

    //console.log(signal.value, parent.children[0].material.color)

    parent.position.x = position[0] + Math.sin(t) * 3
    parent.position.y = position[1] + Math.cos(t) * 3
  })

  return (
    <group rotation={[rotateX, 0, 0]} position={position} scale={scale} ref={groupRef}>
      {boids.map((boid, i) => {
        return (
          <mesh position={boid.position} key={i}>
            <sphereGeometry args={[0.2, 0.4]} attach="geometry" />
            <meshPhongMaterial color={0xffffff} transparent attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

export { Flocking }
