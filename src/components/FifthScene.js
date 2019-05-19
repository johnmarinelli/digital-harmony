import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ShaderBackground } from './Background'
import { useRender } from 'react-three-fiber'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import { DEG } from '../util/Constants'
import { rgbToHex } from '../util/Colors'
import GuiOptions from './Gui'
import { Uniforms, FragmentShader } from '../shaders/FifthScene'

const DifferentialMotion = props => {
  let group = useRef()

  const timeStart = clock.getElapsedTime()

  const [staticObjects] = useMemo(
    () => {
      const data = [
        {
          geometryFn: THREE.SphereBufferGeometry,
          geometryFnArgs: [0.1],
          materialFn: THREE.MeshPhongMaterial,
          materialFnArgs: { color: 'white' },
          position: new THREE.Vector3(0.0, 0.0, 0.1),
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
            castShadow={true}
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

    // need to figure out how to update shadows on move
    for (let i = 0; i < numChildren; ++i) {
      if ('Mesh' === children[i].constructor.name) {
      }
    }
  })

  return (
    <group ref={group}>
      <spotLight position={new THREE.Vector3(0.0, 0.0, 1.5)} intensity={1.2} color="blue" />
      <ambientLight position={new THREE.Vector3(0.0, 0.0, 10.5)} intensity={0.2} color="white" />
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
