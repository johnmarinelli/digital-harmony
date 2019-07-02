import React from 'react'
import * as THREE from 'three'
import { animated } from 'react-spring/three'
import Background from './Background'
import Octahedron from './lib/Octahedron'
import AnimatedSquareOutline from './lib/AnimatedSquareOutline'
import { SquareOutlineStates } from './states/FifthScene'
import AnimatedTetrahedrons from './lib/AnimatedTetrahedrons'
import AnimatedRing from './lib/AnimatedRing'
import LSystem from '../util/LSystem'

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
    const l = new LSystem()
    console.log(l.step())
    console.log(l.step())
    console.log(l.step())
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
            ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <Lights />
        <Octahedron />
        <AnimatedTetrahedrons scale={[0.5, 0.5, 0.5]} position={[-1, -1, 0]} />
        <AnimatedRing scale={[1, 1, 1]} />
        <AnimatedRing
          position={[0, 0, 0.5]}
          rotation={[0, 0, THREE.Math.degToRad(Math.round(Math.random()) * 360)]}
          scale={[1.5, 1.5, 1.5]}
          ringColors={['#cbcbcb', '#ffffff', '#fbfbfb', '#a0a0a0', '#727171']}
        />
        <AnimatedRing
          position={[0, 0, 1]}
          rotation={[0, 0, THREE.Math.degToRad(Math.round(Math.random()) * 360)]}
          scale={[2, 2, 2]}
          ringColors={['#a3a3a3', '#f2f2f2', '#c9c9c9', '#808080', '#5c5b5b']}
        />
        <AnimatedSquareOutline states={SquareOutlineStates} />
      </scene>
    )
  }
}

export default FifthScene
