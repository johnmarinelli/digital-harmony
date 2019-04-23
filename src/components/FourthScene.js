import React from 'react'
import * as THREE from 'three'
import Text from './Text'

class FourthScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top } = this.props

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0x0000ff)}>
        <Text
          opacity={top.interpolate([0, 200], [1, 0])}
          position={top.interpolate(top => [0, -1 + top / 200.0, 0])}
          color="green"
          fontSize={150}
        >
          fourth scene
        </Text>
      </scene>
    )
  }
}

export default FourthScene
