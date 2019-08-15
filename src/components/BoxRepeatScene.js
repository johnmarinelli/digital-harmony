import React from 'react'
import * as THREE from 'three'
import { animated as anim } from 'react-spring/three'
import { LissajousKnot } from '../util/Lissajous'
import Background from './Background'
import GlitchRepeater from './GlitchRepeater'

class BoxRepeatScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    geometry.scale(0.5, 0.5, 0.5)
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }))

    const glitchRepeatUpdateFn = now => LissajousKnot.getPoint(now * 0.1, 3, 4, 7, 0.7, 1.0, 0.0)

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0xff00ff)}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#97082F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <anim.group>
          <GlitchRepeater position={new THREE.Vector3(-2.0, 0.0, 0.0)} mesh={mesh} />
          <GlitchRepeater mesh={mesh} wireframe={true} updateFn={glitchRepeatUpdateFn} />
          <GlitchRepeater position={new THREE.Vector3(2.0, 0.0, 0.0)} mesh={mesh} />
        </anim.group>
      </scene>
    )
  }
}

export default BoxRepeatScene
