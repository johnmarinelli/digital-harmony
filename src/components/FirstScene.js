import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'
import { DEG } from '../util/Constants'
import midi from '../util/WebMidi'
import * as AnimationHelper from '../util/AnimationHelper'

/*
function Octahedron() {
  const [active, setActive] = useState(false)
  const [hovered, setHover] = useState(false)
  const vertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const { color, pos, ...props } = useSpring({
    color: active ? 'hotpink' : 'white',
    pos: active ? [0, 0, 2] : [0, 0, 0],
    'material-opacity': hovered ? 0.6 : 0.25,
    scale: active ? [1.5, 1.5, 1.5] : [1, 1, 1],
    rotation: active ? [THREE.Math.degToRad(180), 0, THREE.Math.degToRad(45)] : [0, 0, 0],
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 },
  })
  return (
    <group>
      <anim.line position={pos}>
        <geometry name="geometry" vertices={vertices.map(v => new THREE.Vector3(...v))} />
        <anim.lineBasicMaterial name="material" color={color} />
      </anim.line>
      <anim.mesh
        onClick={e => setActive(!active)}
        onHover={e => setHover(true)}
        onUnhover={e => setHover(false)}
        {...props}
      >
        <octahedronGeometry name="geometry" />
        <meshStandardMaterial name="material" color="grey" transparent />
      </anim.mesh>
    </group>
  )
}

class Phyllotaxis {
  constructor({ numPoints, material, position, scale, timeStart, timeScale, radius }) {
    this.material = material
      ? material.clone()
      : new THREE.MeshBasicMaterial({
          color: new THREE.Color('white'),
          transparent: true,
          opacity: 0.5,
          wireframe: true,
        })

    this.coords = new Array(numPoints)

    for (let i = 0; i < numPoints; ++i) {
      this.coords[i] = [i / 15.0, 0.0, 0.0]
    }

    this.timeStart = timeStart
    this.timeScale = timeScale
    this.radius = radius
  }

  update() {
    let diff, step, a, x, y

    let numPoints = this.coords.length
    const { timeScale, timeStart, radius } = this

    for (let i = 0; i < numPoints; ++i) {
      diff = clock.getElapsedTime() - this.timeStart
      diff *= timeScale
      step = diff - Math.floor(diff)

      a = 360.0 * step * i
      x = Math.cos(a * DEG) * (i / numPoints) * radius
      y = -Math.sin(a * DEG) * (i / numPoints) * radius

      this.coords[i][0] = x
      this.coords[i][1] = y
    }
  }
}
*/

const PhyllotaxisComponent = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()
  const timeScale = props.timeScale || 0.005
  const radius = props.radius || 2
  const position = props.position || new THREE.Vector3(0.0, 0.0, 0.0)
  const scale = props.scale || new THREE.Vector3(0.25, 0.25, 0.25)
  const numPoints = props.numPointsPerPhyllo || 60

  let midiHandlersAdded = false

  const [geometry, material] = useMemo(
    () => {
      if (!midiHandlersAdded) {
        midi.addListener('noteon', (note, midiNumber) => {}, 'FirstSceneObjectColor')
        midiHandlersAdded = true
      }
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
    const colorAnimationTime = 1.0
    const numChildren = children.length
    let diff = 0.0
    let step = 0.0
    let now = 0.0
    let a, x, y, factorOffset

    for (let i = 0; i < numChildren; ++i) {
      now = clock.getElapsedTime()
      diff = now - timeStart
      diff *= timeScale
      step = diff - Math.floor(diff)

      step -= props.index * 0.015

      a = 360.0 * step * i
      x = Math.cos(a * DEG) * (i / numChildren) * radius
      y = -Math.sin(a * DEG) * (i / numChildren) * radius

      children[i].position.x = x
      children[i].position.y = y

      factorOffset = i * 0.0001

      const factor = AnimationHelper.fadeInThenOut(now - factorOffset, midi.lastNoteOnStartedAt, colorAnimationTime)
      //children[i].material.color.b = factor
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

const DifferentialMotion = props => {
  let group = useRef()
  const rows = 4
  const cols = 3
  const dimension = rows * cols

  const phyllotaxes = []
  let scale, material, index, x, y, z, pct, color

  for (let j = 0; j < rows; ++j) {
    for (let i = 0; i < cols; ++i) {
      color = new THREE.Color(0x0000ff)
      index = j * cols + i
      pct = index / dimension
      scale = (i + 1) * 0.2

      color.b -= pct
      color.r += pct
      material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        wireframe: true,
      })
      // old formula for position: -2.5 + i * 2.0, -3.0 + j * 2.0, 0.0
      x = -2.5 + i * 2.0
      y = 3.0 - j * 2.0
      z = (j % 2) * -1
      phyllotaxes.push(
        <PhyllotaxisComponent
          key={index}
          index={index}
          scale={new THREE.Vector3(scale, scale, scale)}
          position={new THREE.Vector3(x, y, z)}
          material={material}
        />
      )
    }
  }

  return <anim.group ref={group}>{phyllotaxes}</anim.group>
}

class FirstScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.5

    return (
      <scene ref={this.sceneRef}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <DifferentialMotion timeScale={0.005} />
      </scene>
    )
  }
}
export default FirstScene
