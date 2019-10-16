import React, { useRef } from 'react'
import * as THREE from 'three'
import { useThree, useRender } from 'react-three-fiber'
import { withSong } from './420/WithSong'

const EnvironmentMap = props => {
  const { gl: renderer, camera, scene } = useThree()
  const { textureCube } = props
  renderer.gammaOutput = true
  const cameraCube = camera.clone()
  cameraCube.position.set(0, 0, 0)

  const cubeShader = THREE.ShaderLib.cube

  console.log(textureCube)
  const cubeGeometry = new THREE.BoxBufferGeometry(10, 10, 10)
  const cubeMaterial = new THREE.ShaderMaterial({
    fragmentShader: cubeShader.fragmentShader,
    vertexShader: cubeShader.vertexShader,
    uniforms: cubeShader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  })
  cubeMaterial.uniforms.tCube.value = textureCube
  const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)

  const sceneCube = new THREE.Scene()
  sceneCube.add(cubeMesh)

  const Cube = <primitive object={cubeMesh} />
  /*
  const Cube1 = (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[10, 10, 10]} />
      <shaderMaterial
        attach="material"
        fragmentShader={cubeShader.fragmentShader}
        vertexShader={cubeShader.vertexShader}
        uniforms={cubeShader.uniforms}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  )
  */

  useRender(() => {
    cameraCube.rotation.copy(camera.rotation)
    renderer.render(sceneCube, cameraCube)
  })

  return Cube
}

class EnvironmentMapScene extends React.PureComponent {
  constructor() {
    super()
    this.sceneRef = React.createRef()
    const r = '/textures/cube/'
    const urls = [r + 'posx.jpg', r + 'negx.jpg', r + 'posy.jpg', r + 'negy.jpg', r + 'posz.jpg', r + 'negz.jpg']
    this.textureCube = new THREE.CubeTextureLoader().load(urls)
    this.textureCube.format = THREE.RGBFormat
    this.textureCube.mapping = THREE.CubeReflectionMapping
    this.textureCube.encoding = THREE.sRGBEncoding

    this.sphere = (
      <mesh>
        <sphereBufferGeometry attach="geometry" args={[2, 36, 36]} />
        <meshLambertMaterial args={[{ envMap: this.textureCube }]} attach="material" />
      </mesh>
    )
  }

  render() {
    return (
      <scene ref={this.sceneRef}>
        <ambientLight color={0xffffff} />
        <EnvironmentMap textureCube={this.textureCube} />
        {this.sphere}
      </scene>
    )
  }
}

export { EnvironmentMapScene }
