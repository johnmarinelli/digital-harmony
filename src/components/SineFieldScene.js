import React from 'react'
import * as THREE from 'three'
import Background from './Background'
import { SineField } from './sound-enabled/SineField'

class SineFieldScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  shouldComponentUpdate() {
    console.log('shouldComponentUpdate', arguments)
    return false
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    geometry.scale(0.5, 0.5, 0.5)

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0xff00ff)}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#97082F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <SineField />
      </scene>
    )
  }
}

export default SineFieldScene
