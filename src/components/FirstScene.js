import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import Background from './Background'
import { DEG } from '../util/Constants'

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
*/

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

const DifferentialMotion = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()
  const timeScale = props.timeScale || 0.005
  const radius = props.radius || 2
  const numPoints = 60

  const [geometry, geometries, material, coords, phyllotaxes] = useMemo(
    () => {
      const phyllotaxes = []
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

      for (let j = 0; j < 3; ++j) {
        phyllotaxes.push(
          new Phyllotaxis({
            numPoints: numPoints / 3,
            material,
            position: new THREE.Vector3(-2.5 + j, 0.0, 0.0, 0.0),
            scale: 0.33,
            timeStart,
            timeScale,
            radius,
          })
        )
      }
      return [geometry, geometries, material, coords, phyllotaxes]
    },
    [props]
  )

  useRender(() => {
    // @TODO: update phyllotaxes and render
    const { current: { children } } = group
    let diff = 0.0
    let step = 0.0
    let a, x, y

    for (let j = 0; j < phyllotaxes.length; ++j) {
      phyllotaxes[j].update()
    }

    for (let i = 0; i < children.length; ++i) {
      diff = clock.getElapsedTime() - timeStart
      diff *= timeScale
      step = diff - Math.floor(diff)

      a = 360.0 * step * i
      x = Math.cos(a * DEG) * (i / children.length) * radius
      y = -Math.sin(a * DEG) * (i / children.length) * radius

      children[i].position.x = x
      children[i].position.y = y
    }
  })

  return (
    <anim.group ref={group} scale={new THREE.Vector3(0.25, 0.25, 0.25)} position={new THREE.Vector3(-2.5, 0.0, 0.0)}>
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

class FirstScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
    this.differentialMotionProps = {
      timeScale: 0.005,
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
            ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <DifferentialMotion {...this.differentialMotionProps} />
      </scene>
    )
  }
}
export default FirstScene
