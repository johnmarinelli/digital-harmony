import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'
import GuiOptions from './Gui'
import midi from '../util/WebMidi'
import { LissajousKnot, LissajousTrail } from '../util/Lissajous'
import * as AnimationHelper from '../util/AnimationHelper'

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
    let now = clock.getElapsedTime()

    const { current: movingObjects } = trailGroup
    for (let i = 0; i < trail.numParticles; ++i) {
      const point = trail.particles[i]
      const child = movingObjects.children[i]
      child.position.set(point[0], point[1], point[2])

      now = clock.getElapsedTime()
      const factor = AnimationHelper.fadeInThenOut(now, midi.lastNoteOnStartedAt, scaleAnimationTime)
      const scale = 1.0 + factor * 5.0
      child.scale.set(scale, scale, scale)
    }
    diff = now - timeStart
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
