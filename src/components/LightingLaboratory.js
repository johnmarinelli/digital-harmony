import React from 'react'
import * as THREE from 'three'
import { VertexShader, FragmentShader, Uniforms } from '../shaders/LightingLaboratory'

const LightingLaboratory = () => {
  const lightPosition = new THREE.Vector3(0.75, 1.5, 0)
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
  geometry.computeFaceNormals()

  const modelMatrix = new THREE.Matrix4()
  const lightParams = {
    position: lightPosition,
    ambient: new THREE.Vector3(0.9, 0.9, 0.9),
    diffuse: new THREE.Vector3(0.5, 0.5, 0.5),
    specular: new THREE.Vector3(1.0, 1.0, 1.0),
  }

  const texture = new THREE.TextureLoader().load('/textures/lighting-laboratory/texture.png')
  const specular = new THREE.TextureLoader().load('/textures/lighting-laboratory/specular.png')
  const materialParams = {
    diffuse: texture,
    specular,
    shininess: 64,
  }
  const uniforms = Uniforms(modelMatrix, lightParams, materialParams)

  const material = new THREE.ShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    uniforms,
  })
  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <mesh position={lightPosition} scale={[0.2, 0.2, 0.2]}>
        <sphereGeometry attach="geometry" />
        <meshBasicMaterial attach="material" color={0xffffff} />
      </mesh>
    </group>
  )
}

export { LightingLaboratory }
