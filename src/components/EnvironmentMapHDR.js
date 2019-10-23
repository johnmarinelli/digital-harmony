import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'

const EnvironmentCubeHDR = ({ envMap }) => {
  const cubeShader = THREE.ShaderLib.cube
  cubeShader.uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.cube.uniforms)
  cubeShader.uniforms.tCube.value = envMap

  const { fragmentShader, vertexShader, uniforms } = cubeShader
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[5, 5, 5]} />
      <shaderMaterial
        attach="material"
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  )
}
const EnvironmentMapHDR = ({ metalness, roughness, hdrEnvMap, envMap, color, args }) => {
  const mesh = useRef()
  useRender(() => {
    if (mesh.current) {
      mesh.current.rotation.y -= 0.01
    }
  })
  return (
    <>
      <EnvironmentCubeHDR envMap={envMap} />
      <mesh ref={mesh}>
        <torusKnotBufferGeometry attach="geometry" args={args || [2, 0.5, 150, 20]} />
        <meshStandardMaterial
          attach="material"
          envMap={hdrEnvMap}
          color={color || 0xffffff}
          metalness={metalness || 0.5}
          roughness={roughness || 0.5}
        />
      </mesh>
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
