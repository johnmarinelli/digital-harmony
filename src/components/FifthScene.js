import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ShaderBackground } from './Background'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import { Uniforms, FragmentShader } from '../shaders/FifthScene'

const DifferentialMotion = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()

  const [staticObjects] = useMemo(
    () => {
      const data = [
        {
          geometryFn: THREE.BoxBufferGeometry,
          geometryFnArgs: [0.5],
          materialFn: THREE.MeshLambertMaterial,
          materialFnArgs: { color: 'white' },
          position: new THREE.Vector3(0.0, 0.0, 1.0),
        },
      ]
      const staticObjects = data.map((obj, i) => {
        const { geometryFnArgs, materialFnArgs, position } = obj
        return (
          <mesh
            key={i}
            geometry={new obj.geometryFn(...geometryFnArgs)}
            material={new obj.materialFn(materialFnArgs)}
            position={position}
            castShadow
          />
        )
      })
      return [staticObjects]
    },
    [props]
  )

  useRender(() => {
    const { current: { children } } = group
    const numChildren = children.length

    const now = clock.getElapsedTime()

    // need to figure out how to update shadows on move
    for (let i = 0; i < numChildren; ++i) {
      if ('Mesh' === children[i].constructor.name) {
        children[i].position.x = Math.cos(now)
        children[i].position.y = Math.sin(now)
      }
    }
  })
  const d = 200

  return (
    <group ref={group}>
      <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
      {staticObjects}
    </group>
  )
}

class FifthScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, size } = this.props
    const scrollMax = size.height * 4.0

    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0x000000)}>
        <ShaderBackground
          top={top}
          scrollMax={scrollMax}
          color={top.interpolate([0, scrollMax * 0.25], ['#B27193', '#AE709E'])}
          fragmentShader={FragmentShader}
          customUniforms={Uniforms()}
          receiveShadow={true}
        />
        <DifferentialMotion />
      </scene>
    )
  }
}

export default FifthScene
