import React, { useRef } from 'react'
import * as THREE from 'three'
import { useRender, useThree } from 'react-three-fiber'
import { VideoShaderWithOpacity } from '../shaders/VideoShaderWithOpacity'
import { loadVideoAsTexture } from '../util/Loaders'

const VideoBackground = props => {
  const { viewport } = useThree()
  const { width, height } = viewport
  const meshRef = useRef()

  const { domElementId, top } = props

  const video = document.getElementById(domElementId)
  const loop = props.loop || true
  video.loop = loop
  video.isPlaying = false
  video.pause()
  //video.play()

  const texture = loadVideoAsTexture(video)
  const shader = VideoShaderWithOpacity({ texture, resolution: [window.innerWidth, window.innerHeight] })
  const material = new THREE.ShaderMaterial(shader)
  material.transparent = true

  const startAt = props.startAt || 0
  const endAt = props.endAt || 150
  useRender(() => {
    const scrollPos = top.getValue()
    if (scrollPos >= startAt && scrollPos < endAt && !video.isPlaying) {
      video.play()
      video.isPlaying = true
    } else if (top.getValue() >= endAt && video.isPlaying) {
      video.pause()
      video.isPlaying = false
    }
    material.uniforms.opacity.value = top.interpolate([startAt, endAt], [1, 0]).getValue()
  })

  const zPosition = props.zPosition || 0

  // cheap logic that will scale the mesh based on zPosition
  const scaleX = zPosition === 0 ? width : width * Math.abs(zPosition)
  const scaleY = zPosition === 0 ? height : height * Math.abs(zPosition)
  return (
    <mesh position-z={zPosition} scale-x={scaleX} scale-y={scaleY} material={material} ref={meshRef}>
      <planeBufferGeometry attach="geometry" args={[1, 1]} />
    </mesh>
  )
}

export { VideoBackground }
