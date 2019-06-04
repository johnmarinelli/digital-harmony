import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'
import { useRender } from 'react-three-fiber'
import clock from '../util/Clock'

const WavySphere = props => {
  const subject = useRef()

  const [geometry, material] = useMemo(() => {
    const geometry = new THREE.SphereBufferGeometry(1, 32, 32)

    const vertexShader = THREE.ShaderLib.lambert.vertexShader
      .replace(
        '#include <begin_vertex>',
        `vec3 transformed = vec3(position); transformed.x = position.x +  sin(position.y*10.0 + time*10.0)*0.1;`
      )
      .replace('void main() {', 'uniform float time;\nvoid main() {')

    const uniforms = THREE.UniformsUtils.merge([THREE.ShaderLib.lambert.uniforms, { time: { value: 0.0 } }])

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader: THREE.ShaderLib.lambert.fragmentShader,
      lights: true,
      color: 'gray',
    })
    return [geometry, material]
  })

  useRender(() => {
    const { current: mesh } = subject
    mesh.material.uniforms.time.value = clock.getElapsedTime()
  })
  return <mesh position={[0, 0, 1]} ref={subject} geometry={geometry} material={material} name="subject" castShadow />
}

export default WavySphere
