import React, { useRef } from 'react'
import { extend, useRender } from 'react-three-fiber'
import * as THREE from 'three'
import { Transport } from 'tone'
import clock from '../../util/Clock'
import { withSong } from '../420/WithSong'

const generateTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 2
  const context = canvas.getContext('2d')
  context.fillStyle = 'white'
  context.fillRect(0, 1, 2, 1)
  return canvas
}

const Light = props => {
  const { color, positionFn, timeOffset, player } = props
  const groupRef = useRef()
  const distance = 7
  const intensity = 0.9
  const shadowCameraNear = 0.1
  const shadowCameraFar = 6
  const shadowBias = -0.0005 // reduces self-shadowing on double sided objects
  let waveform = new Float32Array(props.waveformResolution)

  const sphereColor = new THREE.Color(color)
  sphereColor.multiplyScalar(intensity)

  const texture = new THREE.CanvasTexture(generateTexture())
  texture.magFilter = THREE.NearestFilter
  texture.wrapT = THREE.RepeatWrapping
  texture.wrapS = THREE.RepeatWrapping
  texture.repeat.set(1, 4.5)

  const threshold = 0.001

  useRender(() => {
    if (groupRef.current) {
      let time = clock.getElapsedTime()
      time += timeOffset
      const newPosition = positionFn(time)
      groupRef.current.position.x = newPosition.x
      groupRef.current.position.y = newPosition.y
      groupRef.current.position.z = newPosition.z

      groupRef.current.rotation.x = time
      groupRef.current.rotation.z = time
    }
    if (player && Transport.state === 'started') {
      player.getWaveform(waveform)
      let avg =
        waveform.reduce((acc, val) => {
          acc += Math.abs(val)
          return acc
        }, 0) / waveform.length

      if (avg > threshold) {
        let scaleVal = 1.0 + avg
        groupRef.current.scale.set(scaleVal, scaleVal, scaleVal)
      } else {
        groupRef.current.scale.set(1, 1, 1)
      }
      // set scale according to waveform here
    }
  })

  return (
    <group ref={groupRef}>
      <pointLight
        color={color}
        intensity={intensity}
        distance={distance}
        shadow-camera-near={shadowCameraNear}
        shadow-camera-far={shadowCameraFar}
        shadow-bias={shadowBias}
        castShadow
      />
      <mesh>
        <sphereBufferGeometry attach="geometry" args={[0.03, 12, 6]} />
        <meshBasicMaterial attach="material" color={sphereColor} />
      </mesh>
      <mesh castShadow receiveShadow>
        <sphereBufferGeometry attach="geometry" args={[0.2, 32, 8]} />
        <meshPhongMaterial attach="material" side={THREE.DoubleSide} alphaMap={texture} alphaTest={0.5} />
        <meshDistanceMaterial attach="customDistanceMaterial" alphaMap={texture} alphaTest={0.5} />
      </mesh>
    </group>
  )
}

const Box = props => {
  const boxDimensions = props.boxDimensions || [6, 6, 6]
  return (
    <mesh position-y={1} receiveShadow>
      <boxBufferGeometry attach="geometry" args={boxDimensions} />
      <meshPhongMaterial attach="material" color={0xa0adaf} shininess={1} specular={0x111111} side={THREE.BackSide} />
    </mesh>
  )
}
class FloatingSphereLights extends React.PureComponent {
  constructor() {
    super()
    this.positionFn = time => ({
      x: Math.sin(time * 0.6) * 0.9,
      y: Math.sin(time * 0.7) * 0.9 + 0.6,
      z: Math.sin(time * 0.8) * 0.9,
    })
    const components = [
      <Light name="snare" waveformResolution={16} color={0xff0000} positionFn={this.positionFn} timeOffset={0} />,
    ]

    const Song = withSong(components, 'grandfather_story', 3)
    extend({ Song })
    this.Song = <Song />
  }

  render() {
    const { boxDimensions } = this.props
    return (
      <group>
        {this.Song}
        <Light color={0x0000ff} positionFn={this.positionFn} timeOffset={10} />
        <Box boxDimensions={boxDimensions} />
      </group>
    )
  }
}

export { FloatingSphereLights }
