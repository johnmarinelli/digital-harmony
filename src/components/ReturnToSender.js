import React, { useEffect } from 'react'
import * as THREE from 'three'
import clock from '../util/Clock'
import { BaseController } from './controllers/Base'
import { Nefertiti } from './models/Nefertiti'
import { Text3D } from './Text3D'

class ReturnToSender extends React.Component {
  constructor() {
    super()

    this.state = { font: null, fontLoaded: false }
  }

  componentDidMount() {
    const fontLoader = new THREE.FontLoader()
    fontLoader.load('/fonts/gentilis_bold.typeface.json', font => {
      this.setState(state => {
        return { font, fontLoaded: true }
      })
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.fontLoaded !== this.state.fontLoaded
  }

  render() {
    return (
      <group position={[0, 0, 0]}>
        <pointLight position={[0, 1, 1]} decay={2} intensity={2} />
        <pointLight position={[1, -1, 0]} decay={2} intensity={2} />
        <pointLight position={[0, -2, 0]} decay={2} intensity={2} />
        <mesh scale={[4, 4, 4]}>
          <cubeGeometry attach="geometry" />
          <meshBasicMaterial attach="material" color="white" opacity={0.1} transparent side={THREE.DoubleSide} />
        </mesh>
        <mesh scale={[4, 4, 4]}>
          <cubeGeometry attach="geometry" />
          <meshBasicMaterial attach="material" color="white" side={THREE.DoubleSide} wireframe />
        </mesh>
        <Nefertiti
          customRenderFn={mesh => {
            mesh.rotation.y += Math.sin(clock.getElapsedTime()) * 0.001
          }}
        />
        <Text3D
          position={[-3.5, -4, 0]}
          fontPath="/fonts/gentilis_bold.typeface.json"
          textContent="&quot;RETURN 2 SENDER&quot;"
        />
      </group>
    )
  }
}

export { ReturnToSender }
