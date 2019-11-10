import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import clock from '../util/Clock'

const generateTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 2
  const context = canvas.getContext('2d')
  context.fillStyle = 'white'
  context.fillRect(0, 1, 2, 1)
  return canvas
}

const Light = props => {
  const { color, positionFn, timeOffset } = props
  const groupRef = useRef()
  const distance = 7
  const intensity = 0.9
  const shadowCameraNear = 0.1
  const shadowCameraFar = 6
  const shadowBias = -0.0005 // reduces self-shadowing on double sided objects

  const sphereColor = new THREE.Color(color)
  sphereColor.multiplyScalar(intensity)

  const texture = new THREE.CanvasTexture(generateTexture())
  texture.magFilter = THREE.NearestFilter
  texture.wrapT = THREE.RepeatWrapping
  texture.wrapS = THREE.RepeatWrapping
  texture.repeat.set(1, 4.5)

  useRender(() => {
    if (groupRef.current) {
      let time = clock.getElapsedTime()
      time += timeOffset
      const newPosition = positionFn(time)
      groupRef.current.position.x = newPosition.x
      groupRef.current.position.y = newPosition.y
      groupRef.current.position.z = newPosition.z

      groupRef.current.rotation.x = time
      groupRef.current.rotation.z = time
    }
  })

  return (
    <group ref={groupRef}>
      <pointLight
        color={color}
        intensity={intensity}
        distance={distance}
        shadow-camera-near={shadowCameraNear}
        shadow-camera-far={shadowCameraFar}
        shadow-bias={shadowBias}
        castShadow
      />
      <mesh>
        <sphereBufferGeometry attach="geometry" args={[0.03, 12, 6]} />
        <meshBasicMaterial attach="material" color={sphereColor} />
      </mesh>
      <mesh castShadow receiveShadow>
        <sphereBufferGeometry attach="geometry" args={[0.2, 32, 8]} />
        <meshPhongMaterial side={THREE.DoubleSide} alphaMap={texture} alphaTest={0.5} attach="material" />
        <meshDistanceMaterial attach="customDistanceMaterial" alphaMap={texture} alphaTest={0.5} />
      </mesh>
    </group>
  )
}

const Box = props => {
  return (
    <mesh position-y={1} receiveShadow>
      <boxBufferGeometry attach="geometry" args={[6, 6, 6]} />
      <meshPhongMaterial attach="material" color={0xa0adaf} shininess={1} specular={0x111111} side={THREE.BackSide} />
    </mesh>
  )
}

const FloatingSphereLights = props => {
  const positionFn = time => ({
    x: Math.sin(time * 0.6) * 0.9,
    y: Math.sin(time * 0.7) * 0.9 + 0.6,
    z: Math.sin(time * 0.8) * 0.9,
  })
  return (
    <group>
      <Light color={0xff0000} positionFn={positionFn} timeOffset={0} />
      <Light color={0x0000ff} positionFn={positionFn} timeOffset={10} />
      <Box />
    </group>
  )
}

export { FloatingSphereLights }
