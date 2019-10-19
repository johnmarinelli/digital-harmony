import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'
import { DEG } from '../util/Constants'

const Phyllotaxis = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()
  const timeScale = props.timeScale || 0.005
  const radius = props.radius || 2
  const position = props.position || new THREE.Vector3(0.0, 0.0, 0.0)
  const scale = props.scale || new THREE.Vector3(0.25, 0.25, 0.25)
  const numPoints = props.numPointsPerPhyllo || 60

  const [geometry, material] = useMemo(
    () => {
      const geometry = props.geometry ? props.geometry.clone() : new THREE.SphereBufferGeometry(0.05, 10, 10)
      const material = props.material
        ? props.material.clone()
        : new THREE.MeshBasicMaterial({
            color: new THREE.Color('white'),
            transparent: true,
            opacity: 0.5,
            wireframe: true,
          })

      return [geometry, material]
    },
    [props]
  )

  useRender(() => {
    const { current: { children } } = group
    const numChildren = children.length
    let diff = 0.0
    let step = 0.0
    let now = 0.0
    let a, x, y

    for (let i = 0; i < numChildren; ++i) {
      now = clock.getElapsedTime()
      diff = now - timeStart
      diff *= timeScale
      step = diff - Math.floor(diff)

      a = 360.0 * step * i
      x = Math.cos(a * DEG) * (i / numChildren) * radius
      y = -Math.sin(a * DEG) * (i / numChildren) * radius

      children[i].position.x = x
      children[i].position.y = y
    }
  })

  return (
    <anim.group ref={group} scale={scale} position={position}>
      {new Array(numPoints)
        .fill(null)
        .map((_, i) => <anim.mesh key={i} geometry={geometry} material={material} position={[0.0, 0.0, 0.0]} />)}
    </anim.group>
  )
}

class PhyllotaxisScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    return (
      <scene ref={this.sceneRef}>
        <Phyllotaxis position={[0, 0, 0]} scale={[1, 1, 1]} />
      </scene>
    )
  }
}

const PhyllotaxisWithScrollingBackground = ({ top, scrollMax }) => {
  return (
    <scene ref={this.sceneRef}>
      <Background
        color={top.interpolate(
          [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
          ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
        )}
      />
      <Phyllotaxis position={[0, 0, 0]} scale={[1, 1, 1]} />
    </scene>
  )
}

export { PhyllotaxisScene, Phyllotaxis, PhyllotaxisWithScrollingBackground }
export default PhyllotaxisScene
