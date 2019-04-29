import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'
import GuiOptions from './Gui'
import midi from '../util/WebMidi'

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
      points[i] = LissajousKnot.getPoint(i * pointRatio)
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
    // array of 3d arrays
    this.particles = []
    this.stepMode = 'continuous'
    this.cycleTime = 10

    for (let i = 0; i < this.numParticles; ++i) {
      this.particles.push({})
    }
  }

  attachKnot(knot) {
    this.knot = knot
  }

  setCycleTime(seconds) {
    this.cycleTime = seconds
  }

  setStepMode(stepMode) {
    if (['discrete', 'continuous'].indexOf(stepMode) > -1) {
      this.stepMode = stepMode
    } else {
      console.warn(`Step mode "${stepMode}" for LissajousTrail is invalid.  Use either "discrete" or "continuous"`)
    }
  }

  update(elapsed) {
    const { numParticles, particles, stepMode } = this
    if (stepMode === 'continuous') {
      for (let i = numParticles - 1; i >= 0; --i) {
        const point = LissajousKnot.getPoint(elapsed + i)
        particles[i] = point
      }
    } else {
      const { knot, cycleTime } = this
      const { numPoints } = knot
      const cyclePercentage = (elapsed / cycleTime) % 1.0
      const basePointIndex = Math.floor(cyclePercentage * numPoints)

      for (let i = numParticles - 1; i >= 0; --i) {
        const pointIndex = (basePointIndex + i) % knot.points.length
        particles[i] = knot.points[pointIndex]
      }
    }
  }
}

const DifferentialMotion = props => {
  let knotGroup = useRef(),
    trailGroup = useRef()

  const timeStart = clock.getElapsedTime()
  const numMovingObjects = 24
  const numPoints = 1000
  const cycleTime = 50 // in seconds

  let midiHandlersAdded = false
  let scaleAnimationTime = 0.25 // one-way, in seconds

  const [knot, movingObjects, trail] = useMemo(() => {
    /*
      * for some reason, useMemo gets called twice.
      * we only want to add listeners once
      */
    if (!midiHandlersAdded) {
      midi.addListener(
        'noteon',
        (note, midiNumber) => {
          if (midiNumber > 85) {
          }
        },
        'ThirdSceneObjectScale'
      )
      midiHandlersAdded = true
    }

    const knot = new LissajousKnot({ numPoints, pointRatio: 1 / 20.0 })
    const trail = new LissajousTrail({ numParticles: numMovingObjects })
    trail.attachKnot(knot)
    trail.setStepMode('discrete')
    trail.setCycleTime(cycleTime)
    const movingObjects = []

    for (let i = 0; i < numMovingObjects; ++i) {
      movingObjects.push(i)
    }

    return [knot, movingObjects, trail]
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
        child.position.x = knot.points[i][0]
        child.position.y = knot.points[i][1]
        child.position.z = knot.points[i][2]

        child.scale.x = GuiOptions.options.sphereScale
        child.scale.y = GuiOptions.options.sphereScale
        child.scale.z = GuiOptions.options.sphereScale
      }
    } else {
      knotGroup.current.visible = false
    }

    if (GuiOptions.options.lissajousTrailDiscrete && trail.stepMode !== 'discrete') {
      trail.setStepMode('discrete')
    } else if (!GuiOptions.options.lissajousTrailDiscrete && trail.stepMode !== 'continuous') {
      trail.setStepMode('continuous')
    }
    trail.update(diff)

    const lastNoteStartedAt = midi.lastNoteOnStartedAt
    const scaleDiff = lastNoteStartedAt === 0.0 ? 0.0 : now - lastNoteStartedAt + 0.5

    const { current: movingObjects } = trailGroup
    for (let i = 0; i < trail.numParticles; ++i) {
      const point = trail.particles[i]
      const child = movingObjects.children[i]
      child.position.set(point[0], point[1], point[2])

      //let scale = point[2] * 2.0
      let scale = 1.0
      if (scaleDiff <= scaleAnimationTime * 2.0) {
        const isPastHalfwayPoint = scaleDiff - scaleAnimationTime >= 0.0
        const factor = isPastHalfwayPoint ? scaleAnimationTime - (scaleDiff - scaleAnimationTime) : scaleDiff
        scale += factor * 5.0
      }
      child.scale.set(scale, scale, scale)
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
      <anim.group ref={trailGroup}>
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
