import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useRender, useThree } from 'react-three-fiber'
import { apply as applySpring, useSpring, animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'
import { DEG } from '../util/Constants'

const LissajousKnot = t => {
  const nx = 3,
    ny = 2,
    nz = 5,
    px = Math.PI * 0.5,
    py = 0.7,
    pz = 0.0

  const x = Math.cos(nz * t + px),
    y = Math.cos(ny * t + py),
    z = Math.cos(nz * t + pz)

  return [x, y, z]
}

const DifferentialMotion = props => {
  let group = useRef()
  const { viewport } = useThree()
  const { width, height } = viewport()

  const timeStart = clock.getElapsedTime()
  const timeScale = props.timeScale || 0.005
  const radius = props.radius || 2
  const numPoints = 100

  const [geometry] = useMemo(() => {
    const seedPoints = []

    for (let i = 0; i < numPoints; ++i) {
      const p = LissajousKnot(i)
      const v = new THREE.Vector3(...p)
      v.multiplyScalar(1.5)
      seedPoints.push(v)
    }

    const curve = new THREE.CatmullRomCurve3(seedPoints)
    const points = curve.getPoints(500)

    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    return [geometry]
  })

  useRender(() => {})

  return (
    <anim.line geometry={geometry}>
      <anim.lineBasicMaterial name="material" color="white" />
    </anim.line>
  )
}

class ThirdScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
    this.differentialMotionProps = {
      timeScale: 0.1,
      radius: 3,
    }
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5

    return (
      <scene ref={this.sceneRef}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#e82968', '#eec919', '#504006', '#e32f01']
          )}
        />
        <DifferentialMotion {...this.differentialMotionProps} />
      </scene>
    )
  }
}
export default ThirdScene
