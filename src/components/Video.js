import React from 'react'

import * as THREE from 'three'

/*
 * import MeshifyShader from '../shaders/MeshifyShader'
 * props.shader = MeshifyShader({ texture, resolution: [window.innerWidth, window.innerHeight] })
 */
class Video extends React.PureComponent {
  render() {
    const { props } = this

    const { dimensions, domElementId } = props

    const video = document.getElementById(domElementId)
    video.loop = true
    video.play()
    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBFormat

    /*
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
