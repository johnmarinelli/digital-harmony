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

const StripedLight = props => {
  const { color, positionFn, timeOffset, soundReactionFn } = props
  const groupRef = useRef()
  const distance = props.distance || 7
  const intensity = props.intensity || 0.9
  const shadowCameraNear = props.shadowCameraNear || 0.1
  const shadowCameraFar = props.shadowCameraFar || 6
  const shadowBias = props.shadowBias || -0.0005 // reduces self-shadowing on double sided objects

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
    if (soundReactionFn) {
      soundReactionFn(groupRef)
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

const ShadowEnabledBox = props => {
  const boxDimensions = props.boxDimensions || [6, 6, 6]
  const yPosition = props.yPosition || 1
  return (
    <mesh position-y={yPosition} receiveShadow>
      <boxBufferGeometry attach="geometry" args={boxDimensions} />
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
  const { boxDimensions, boxYPosition } = props
  return (
    <group>
      <StripedLight color={0xff0000} positionFn={positionFn} timeOffset={0} />
      <StripedLight color={0x0000ff} positionFn={positionFn} timeOffset={10} />
      <ShadowEnabledBox boxDimensions={boxDimensions} yPosition={boxYPosition} />
    </group>
  )
}

export { StripedLight, FloatingSphereLights, ShadowEnabledBox }
