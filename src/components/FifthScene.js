import React, { useMemo } from 'react'
import * as THREE from 'three'
import { animated } from 'react-spring/three'
import Background from './Background'
import Octahedron from './lib/Octahedron'
import AnimatedSquareOutline from './lib/AnimatedSquareOutline'
import AnimatedTetrahedrons from './lib/AnimatedTetrahedrons'
import AnimatedRing from './lib/AnimatedRing'
import LindenmayerTree from './lib/LindenmayerTree'

const Lights = () => (
  <>
    <ambientLight color={0xffffff} intensity={0.8} />
    <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
  </>
)

class FifthScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.0

    return (
      <scene ref={this.sceneRef}>
        <Background
          top={top}
          scrollMax={scrollMax}
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#565656', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <Lights />
        <Octahedron />
        {/*<AnimatedSquareOutline />*/}
      </scene>
    )
  }
}

export default FifthScene
