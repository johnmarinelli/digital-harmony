import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useRender, useThree } from 'react-three-fiber'
import { apply as applySpring, useSpring, animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'
import { DEG } from '../util/Constants'
import GuiOptions from './Gui'

class LissajousKnot {
  constructor({ numPoints, pointRatio }) {
    this.pointRatio = pointRatio
    this.numPoints = numPoints
    this.points = new Array(numPoints)
    this.getPoint = this.getPoint.bind(this)
    this.updatePoints = this.updatePoints.bind(this)
    this.update = this.update.bind(this)

    this.updatePoints(0)
  }

  updatePoints(dt) {
    const { numPoints, getPoint, points, pointRatio } = this
    for (let i = 0; i < numPoints; ++i) {
      const p = getPoint(i * pointRatio)
      const v = new THREE.Vector3(...p)
      points[i] = v
    }
  }

  getPoint(t) {
    const { nX, nY, nZ, phaseShift1, phaseShift2, phaseShift3 } = GuiOptions.options

    const x = Math.cos(nX * t + phaseShift1),
      y = Math.cos(nY * t + phaseShift2),
      z = Math.cos(nZ * t + phaseShift3)

    return [x, y, z]
  }

  update(dt) {
    this.updatePoints(dt)
  }
}

const DifferentialMotion = props => {
  let lineRef = useRef(),
    group = useRef()
  const { viewport } = useThree()
  const { width, height } = viewport()

  const timeStart = clock.getElapsedTime()
  const timeScale = props.timeScale || 0.005
  const numPoints = 1000

  const [geometry, knot] = useMemo(() => {
    const knot = new LissajousKnot({ numPoints, pointRatio: 1 / 20.0 })
    const geometry = new THREE.BufferGeometry().setFromPoints(knot.points)

    return [geometry, knot]
  })

  let diff = 0
  let scale = null
  useRender(() => {
    knot.update(diff)

    const { current: { children } } = group
    const { options: { sphereScale } } = GuiOptions

    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      child.position.x = knot.points[i].x
      child.position.y = knot.points[i].y
      child.position.z = knot.points[i].z

      child.scale.x = GuiOptions.options.sphereScale
      child.scale.y = GuiOptions.options.sphereScale
      child.scale.z = GuiOptions.options.sphereScale
    }
  })

  const sphereGeometry = new THREE.SphereBufferGeometry(0.05, 10, 10)
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('white'),
    transparent: true,
    opacity: 0.5,
    wireframe: true,
  })
  return (
    <anim.group ref={group}>
      {knot.points.map((point, i) => (
        <anim.mesh position={[point.x, point.y, point.z]} key={i} material={material} geometry={sphereGeometry} />
      ))}
    </anim.group>
  )
}

class ThirdScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
    this.differentialMotionProps = {
      timeScale: 0.1,
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
