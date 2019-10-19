import React, { useRef } from 'react'
import * as THREE from 'three'
import { useThree, useRender } from 'react-three-fiber'
import { withSong } from './420/WithSong'
import { loadEnvironmentMapUrls } from '../util/Loaders'

const EnvironmentMappedSphere = ({ cubeTexture, sphereBufferGeometryArgs }) => {
  const sphereArgs = sphereBufferGeometryArgs || [2, 36, 36]
  return (
    <mesh>
      <sphereBufferGeometry attach="geometry" args={sphereArgs} />
      <meshLambertMaterial attach="material" args={[{ envMap: cubeTexture }]} />
    </mesh>
  )
}

const EnvironmentCube = ({ fragmentShader, vertexShader, uniforms }) => {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[10, 10, 10]} />
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

/*
const EnvironmentCubeMesh = ({ fragmentShader, vertexShader, uniforms }) => {
  const geometry = new THREE.BoxBufferGeometry(10, 10, 10)
  const material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}
*/

const EnvironmentMap = props => {
  const { gl: renderer } = useThree()
  const { cubeTexture } = props
  renderer.gammaOutput = true
  const cubeShader = THREE.ShaderLib.cube
  cubeShader.uniforms.tCube.value = cubeTexture
  return (
    <>
      <ambientLight color={0xffffff} />
      <EnvironmentCube
        fragmentShader={cubeShader.fragmentShader}
        vertexShader={cubeShader.vertexShader}
        uniforms={cubeShader.uniforms}
      />
      <EnvironmentMappedSphere cubeTexture={cubeTexture} />
    </>
  )
}

class EnvironmentMapScene extends React.Component {
  constructor() {
    super()
    this.sceneRef = React.createRef()
    this.cubeTexture = loadEnvironmentMapUrls('daylight-bridge')
  }

  render() {
    return (
      <scene ref={this.sceneRef}>
        <EnvironmentMap cubeTexture={this.cubeTexture} />
      </scene>
    )
  }
}

export { EnvironmentMap, EnvironmentMapScene }
