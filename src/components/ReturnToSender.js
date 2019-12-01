import React, { useEffect } from 'react'
import * as THREE from 'three'
import clock from '../util/Clock'
import { BaseController } from './controllers/Base'
import { Nefertiti } from './models/Nefertiti'

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
    const { top } = this.props
    return (
      <group position={[0, 1, 0]}>
        <pointLight position={[0, 1, 1]} decay={2} intensity={2} />
        <pointLight position={[1, -1, 0]} decay={2} intensity={2} />
        <pointLight position={[0, -2, 0]} decay={2} intensity={2} />
        <Nefertiti
          customRenderFn={mesh => {
            mesh.rotation.y += Math.sin(clock.getElapsedTime()) * 0.001
          }}
        />
        {this.state.fontLoaded ? (
          <mesh position={[-3.5, -3, 0]}>
            <textGeometry
              attach="geometry"
              args={[
                '"RETURN TO SENDER"',
                {
                  font: this.state.font,
                  size: 0.5,
                  height: 0.5,
                  curveSegments: 1,
                  bevelEnabled: false,
                },
              ]}
            />
            <meshPhongMaterial attach="material" color={0xff0000} specular={0xffffff} />
          </mesh>
        ) : null}
        {/*
        <Text opacity={top.interpolate([0, 200], [1, 0])} position={[0, 1.5, 2]} color="red" fontSize={100}>
          RETURN TO SENDER
        </Text>
        */}
      </group>
    )
  }
}

export { ReturnToSender }
