import React from 'react'
import * as THREE from 'three'
import { apply as applySpring, useSpring, animated as anim } from 'react-spring/three'
import Text from './Text'

class SecondScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top } = this.props

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0xff00ff)}>
        <anim.spotLight intensity={1.2} color="blue" />
        <Text
          opacity={top.interpolate([0, 200], [1, 0])}
          position={top.interpolate(top => [0, -1 + top / 200.0, 0])}
          color="red"
          fontSize={150}
        >
          sêcond scene
        </Text>
      </scene>
    )
  }
}

export default SecondScene
