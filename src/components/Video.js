import React from 'react'
import * as THREE from 'three'
import { loadVideoAsTexture } from '../util/Loaders'

/*
 * import MeshifyShader from '../shaders/MeshifyShader'
 * props.shader = MeshifyShader({ texture, resolution: [window.innerWidth, window.innerHeight] })
 */
class Video extends React.PureComponent {
  render() {
    const { props } = this

    const { position, rotation, dimensions, domElementId } = props

    const video = document.getElementById(domElementId)
    const loop = props.loop || true
    video.loop = loop
    video.play()

    const texture = loadVideoAsTexture(video)

    return (
      <mesh rotation={rotation || [0, 0, 0]} position={position || [0, 0, 0]}>
        <meshBasicMaterial attach="material" map={texture} side={THREE.DoubleSide} />
        <planeBufferGeometry attach="geometry" args={dimensions || [5, 5]} />
      </mesh>
    )
  }
}

export { Video }
