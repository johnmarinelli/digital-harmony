import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Background from './Background'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import { DEG } from '../util/Constants'

const DifferentialMotion = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()
  const timeScale = props.timeScale || 0.005
  const radius = props.radius || 2
  const numPoints = 60

  const [geometry, geometries, material, coords] = useMemo(
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
      const coords = new Array(numPoints)
      const geometries = new Array(numPoints)

      for (let i = 0; i < coords.length; ++i) {
        coords[i] = [i / 15.0, 0.0, 0.0]
        geometries[i] = props.geometryGenerator ? props.geometryGenerator(i, coords.length) : null
        //geometries[i].rotateX(90.0 * DEG)
      }
      return [geometry, geometries, material, coords]
    },
    [props]
  )

  useRender(() => {
    const { current: { children } } = group
    let diff = 0.0
    let step = 0.0
    let a, x, y

    const r = radius * 3

    let biggestX = -Infinity

    for (let i = 0; i < children.length; ++i) {
      diff = clock.getElapsedTime() - timeStart
      diff *= timeScale
      step = diff - Math.floor(diff)

      //a = 360.0 * step * i
      //x = Math.cos(a * DEG) * (i / children.length) * radius
      //y = -Math.sin(a * DEG) * (i / children.length) * radius
      a = -90 + 360 * i / numPoints

      x = Math.cos(a * DEG) * radius + i * step * r
      x = -r / 2 + (x + r / 2) % r
      y = Math.sin(a * DEG) * radius

      children[i].position.x = x
      children[i].position.y = y
    }
  })

  return (
    <anim.group ref={group}>
      {coords.map(([x, y, z], i) => (
        <anim.mesh
          key={i}
          geometry={props.geometryGenerator ? geometries[i] : geometry}
          material={material}
          position={[x, y, z]}
        />
      ))}
    </anim.group>
  )
}

class FourthScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0x0000ff)}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#FF0000', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <DifferentialMotion {...this.differentialMotionProps} />
      </scene>
    )
  }
}

export default FourthScene
