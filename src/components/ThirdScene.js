import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'
import GuiOptions from './Gui'

class LissajousKnot {
  constructor({ numPoints, pointRatio }) {
    this.pointRatio = pointRatio
    this.numPoints = numPoints
    this.points = new Array(numPoints)
    this.updatePoints = this.updatePoints.bind(this)
    this.update = this.update.bind(this)

    this.updatePoints(0)
  }

  updatePoints(dt) {
    const { numPoints, points, pointRatio } = this
    for (let i = 0; i < numPoints; ++i) {
      const p = LissajousKnot.getPoint(i * pointRatio)
      const v = new THREE.Vector3(...p)
      points[i] = v
    }
  }

  static getPoint(t) {
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

class LissajousTrail {
  constructor({ numParticles }) {
    this.numParticles = numParticles
    this.trailParticles = []

    for (let i = 0; i < numParticles; ++i) {
      this.trailParticles.push(null)
    }
  }
}

const DifferentialMotion = props => {
  //let lineRef = useRef(),
  let knotGroup = useRef(),
    movingRef = useRef(),
    movingGroup = useRef()

  const timeStart = clock.getElapsedTime()
  const numMovingObjects = 24
  const numPoints = 1000
  const cycleTime = 50 // in seconds

  const [knot, movingObjects] = useMemo(() => {
    const knot = new LissajousKnot({ numPoints, pointRatio: 1 / 20.0 })
    const movingObjects = []

    for (let i = 0; i < numMovingObjects; ++i) {
      movingObjects.push(i)
    }

    return [knot, movingObjects]
  })

  let diff = 0,
    i
  useRender(() => {
    const now = clock.getElapsedTime()
    diff = now - timeStart
    knot.update(diff)

    const { current: { children } } = knotGroup

    if (GuiOptions.options.lissajousKnotVisible) {
      knotGroup.current.visible = true
      for (i = 0; i < children.length; ++i) {
        const child = children[i]
        child.position.x = knot.points[i].x
        child.position.y = knot.points[i].y
        child.position.z = knot.points[i].z

        child.scale.x = GuiOptions.options.sphereScale
        child.scale.y = GuiOptions.options.sphereScale
        child.scale.z = GuiOptions.options.sphereScale
      }
    } else {
      knotGroup.current.visible = false
    }

    const { current: movingObjects } = movingGroup
    const cyclePercentage = (diff / cycleTime) % 1.0
    //const cyclePercentage = (Math.sin(1 / cycleTime * now) + 1.0) * 0.5
    const basePointIndex = Math.floor(cyclePercentage * children.length)

    for (i = movingObjects.children.length - 1; i >= 0; --i) {
      /*
      const pointIndex = (basePointIndex + i) % knot.points.length
      const point = knot.points[pointIndex]
      */
      const point = LissajousKnot.getPoint(now + i)

      const child = movingObjects.children[i]
      child.position.set(point[0], point[1], point[2])
      const scaleZ = point[2] * 2.0
      child.scale.set(scaleZ, scaleZ, scaleZ)
    }
  })

  const sphereGeometry = new THREE.SphereBufferGeometry(0.05, 10, 10)
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('white'),
    transparent: true,
    opacity: 0.5,
    wireframe: true,
  })

  const movingGeometry = new THREE.CubeGeometry(0.1, 0.1, 0.1)
  const movingMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('blue'),
    transparent: true,
    opacity: 0.5,
  })
  return (
    <anim.group>
      <anim.group ref={movingGroup}>
        {movingObjects.map((position, index) => (
          <anim.mesh position={[0, 0, 0]} key={index} material={movingMaterial} geometry={movingGeometry} />
        ))}
      </anim.group>
      <anim.group ref={knotGroup}>
        {knot.points.map((point, index) => (
          <anim.mesh position={[point.x, point.y, point.z]} key={index} material={material} geometry={sphereGeometry} />
        ))}
      </anim.group>
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
