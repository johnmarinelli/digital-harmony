import React, { useRef } from 'react'
import * as THREE from 'three'
import { useRender, useThree } from 'react-three-fiber'
import { VideoShaderWithOpacity } from '../shaders/VideoShaderWithOpacity'

const videoAsTexture = (videoElement, opts) => {
  const texture = new THREE.VideoTexture(videoElement)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.format = THREE.RGBFormat

  return texture
}

/*
 * import MeshifyShader from '../shaders/MeshifyShader'
 * props.shader = MeshifyShader({ texture, resolution: [window.innerWidth, window.innerHeight] })
 */
class Video extends React.PureComponent {
  render() {
    const { props } = this

    const { dimensions, domElementId } = props

    const video = document.getElementById(domElementId)
    const loop = props.loop || true
    video.loop = loop
    video.play()

    const texture = videoAsTexture(video)

    /*
     * if we want to use custom shader
    let material = null
    if (props.shader) {
      material = new THREE.ShaderMaterial(props.shader)
    }
    */

    return (
      <mesh>
        <meshBasicMaterial attach="material" map={texture} side={THREE.DoubleSide} />
        <planeBufferGeometry attach="geometry" args={dimensions || [5, 5]} />
      </mesh>
    )
  }
}

const VideoBackground = props => {
  const { viewport } = useThree()
  const { width, height } = viewport
  const meshRef = useRef()

  const { domElementId, top } = props

  const video = document.getElementById(domElementId)
  const loop = props.loop || true
  video.loop = loop
  video.play()

  const texture = videoAsTexture(video)
  const shader = VideoShaderWithOpacity({ texture, resolution: [window.innerWidth, window.innerHeight] })
  const material = new THREE.ShaderMaterial(shader)
  material.transparent = true

  useRender(() => {
    material.uniforms.opacity.value = top.interpolate([0, 150], [1, 0]).getValue()
  })

  return (
    <mesh scale-x={width} scale-y={height} material={material} ref={meshRef}>
      <planeBufferGeometry attach="geometry" args={[1, 1]} />
    </mesh>
  )
}

export { Video, VideoBackground }
