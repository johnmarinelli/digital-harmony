import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Background from './Background'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import { DEG } from '../util/Constants'
import { rgbToHex } from '../util/Colors'
import GuiOptions from './Gui'

const DifferentialMotion = props => {
  let group = useRef()

  const startTime = clock.getElapsedTime()
  const radius = props.radius || 2.5
  const numPoints = props.numPoints || 60

  const [geometry, material, coords, materials] = useMemo(
    () => {
      const geometry = props.geometry ? props.geometry.clone() : new THREE.SphereGeometry(0.05, 10, 10)
      const materials = []
      let baseMaterial = props.material
        ? props.material.clone()
        : new THREE.MeshBasicMaterial({
            color: new THREE.Color('white'),
            transparent: true,
            opacity: 1.0,
            //wireframe: true,
          })
      const coords = new Array(numPoints)
      for (let i = 0; i < coords.length; ++i) {
        const pointIndexAsFraction = i / coords.length
        const pointIndexScaled = Math.floor(pointIndexAsFraction * 255.0)

        const red = Math.min(64, pointIndexScaled)
        const green = 28
        const blue = Math.min(128, pointIndexScaled)
        const hex = rgbToHex(red, green, blue)

        coords[i] = [i / 15.0, 0.0, 0.0]

        const material = baseMaterial.clone()
        material.color.set(hex)
        materials.push(material)
      }
      return [geometry, material, coords, materials]
    },
    [props]
  )

  const fns = {
    cos: Math.cos,
    sin: Math.sin,
  }

  useRender(() => {
    const { current: { children } } = group
    let step = 0.0
    let a, x, y, pointIndexAsFraction, diff, now

    const r = radius * 3
    const timeScale = GuiOptions.options.fourthSceneTimeScale

    const fnX = fns[GuiOptions.options.zPositionFunctionX]
    const fnY = fns[GuiOptions.options.zPositionFunctionY]

    for (let i = 0; i < children.length; ++i) {
      now = clock.getElapsedTime()
      if (GuiOptions.options.cyclePercentageOverride) {
        step = GuiOptions.options.cyclePercentage
      } else {
        diff = now - startTime
        step = diff * timeScale
        GuiOptions.options.cyclePercentage = step % 1.0
      }

      pointIndexAsFraction = i / children.length

      a = -90 + 360 * pointIndexAsFraction

      x = Math.cos(a * DEG) * radius + i * step * r
      x = -r / 2 + (x + r / 2) % r
      y = Math.sin(a * DEG) * radius

      children[i].position.x = x
      children[i].position.y = y
      children[i].position.z = fnX(x) * fnY(y)

      children[i].rotation.x = x
      children[i].rotation.y = y
      children[i].rotation.z = fnX(x) * fnY(y)
    }
  })

  return (
    <anim.group ref={group}>
      {coords.map(([x, y, z], i) => (
        <anim.mesh key={i} geometry={geometry} material={materials[i]} position={[x, y, z]} />
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

    const geometry = new THREE.ConeGeometry(0.05, 0.25)
    geometry.rotateZ(270 * DEG)

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0x000000)}>
        <Background
          color={top.interpolate(
            [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
            ['#FF0000', '#247BA0', '#70C1B3', '#f8f3f1']
          )}
        />
        <DifferentialMotion numPoints={60} geometry={geometry} />
      </scene>
    )
  }
}

export default FourthScene
