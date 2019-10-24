import React, { useRef } from 'react'
import { useRender, useThree } from 'react-three-fiber'
import { animated } from 'react-spring/three'
import * as THREE from 'three'

const RotateCamera = ({ Component, factor }) => {
  const { camera } = useThree()
  useRender(() => {
    camera.rotation.x = factor.getValue()
    camera.position.z = 6 - factor.getValue()
  })
  return Component
}

const EnvironmentCubeHDR = ({ envMap, factor }) => {
  const cubeShader = THREE.ShaderLib.cube
  cubeShader.uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.cube.uniforms)
  cubeShader.uniforms.tCube.value = envMap

  const { fragmentShader, vertexShader, uniforms } = cubeShader
  return (
    <animated.mesh>
      <boxBufferGeometry attach="geometry" args={[5, 5, 5]} />
      <shaderMaterial
        attach="material"
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </animated.mesh>
  )
}
const EnvironmentMappedTorus = ({ metalness, roughness, hdrEnvMap, color, geometryArgs, factor }) => {
  const mesh = useRef()
  useRender(() => {
    if (mesh.current) {
      mesh.current.rotation.y -= 0.01
    }
  })
  return (
    <mesh ref={mesh}>
      <torusKnotBufferGeometry attach="geometry" args={geometryArgs || [2, 0.5, 150, 20]} />
      <meshStandardMaterial
        attach="material"
        envMap={hdrEnvMap}
        color={color || 0xffffff}
        metalness={metalness || 0.5}
        roughness={roughness || 0.5}
      />
    </mesh>
  )
}

const EnvironmentMapHDR = ({ metalness, roughness, hdrEnvMap, envMap, color, geometryArgs, factor }) => {
  return (
    <>
      {/* <RotateCamera Component={<EnvironmentCubeHDR envMap={envMap} factor={factor} />} factor={factor} /> */}
      <EnvironmentCubeHDR envMap={envMap} factor={factor} />
      <EnvironmentMappedTorus
        metalness={metalness}
        roughness={roughness}
        hdrEnvMap={hdrEnvMap}
        color={color}
        gometryArgs={geometryArgs}
      />
    </>
  )
}

class EnvironmentMapHDRScene extends React.Component {
  constructor(props) {
    super(props)
    this.sceneRef = React.createRef()
  }

  render() {
    const { hdrEnvMap } = this.props
    return (
      <scene ref={this.sceneRef}>
        <EnvironmentCubeHDR hdrEnvMap={hdrEnvMap} />
        <EnvironmentMapHDR hdrEnvMap={hdrEnvMap} />
      </scene>
    )
  }
}

export { EnvironmentMapHDR, EnvironmentMapHDRScene }
