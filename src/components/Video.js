import React, { useRef } from 'react'
import * as THREE from 'three'
import { useRender, useThree } from 'react-three-fiber'
import { VideoShaderWithOpacity } from '../shaders/VideoShaderWithOpacity'
import { loadVideoAsTexture } from '../util/Loaders'

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

    const texture = loadVideoAsTexture(video)

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

export { Video }
