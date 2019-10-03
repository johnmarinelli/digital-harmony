import React, { useRef } from 'react'
import { extend } from 'react-three-fiber'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'
import clock from '../../util/Clock'
import { SoundWave } from './SoundWave'
import { withSong } from './WithSong'

const SineField = props => {
  let group = useRef()

  //const timeStart = clock.getElapsedTime()

  const groupRef = useRef()

  /*
  const [geometries, colors] = useMemo(() => {
    const geometries = [],
      colors = []
    let color = new THREE.Color(0x000000)

    let pct = 0
    for (let i = 0; i < numLines; ++i) {
      pct = i / numLines
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array(numPoints * 3)
      let x, y, z

      color.r = 1 - pct
      color.g = 1 - pct
      color.b = 1 - pct

      for (let j = 0; j < numPoints; ++j) {
        x = j / numPoints * 20.0 - 5.0
        y = Math.sin(x) * amplitude
        z = -1

        const verticesBaseIndex = j * 3
        vertices[verticesBaseIndex] = x
        vertices[verticesBaseIndex + 1] = y
        vertices[verticesBaseIndex + 2] = z
      }

      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.computeBoundingSphere()

      geometries.push(geometry)
      colors.push(color.clone())
    }

    return [geometries, colors]
  })

  const lines = geometries.map((geometry, i) => {
    return (
      <anim.line key={i} name="mesh" geometry={geometry} material={new THREE.LineBasicMaterial({ color: colors[i] })} />
    )
  })
    */

  useRender(() => {
    /*
    const diff = clock.getElapsedTime() - timeStart
    let x, y
    for (let i = 0; i < numLines; ++i) {
      const geometry = groupRef.current.children[i].geometry
      const positions = geometry.attributes.position.array
      for (let j = 0; j < numPoints; ++j) {
        const positionsBaseIndex = j * 3
        x = positions[positionsBaseIndex]
        y = 1 / (i + 1) * Math.sin((i + 1) * x + diff) * amplitude
        positions[positionsBaseIndex + 1] = y
      }
      geometry.attributes.position.needsUpdate = true
    }
    */
  })

  const tracks = ['battery', 'vocals']
  const soundwaves = []
  for (let i = 0; i < tracks.length; ++i) {
    const wave = (
      <SoundWave
        position={[0, i, 0]}
        waveformResolution={128}
        size={10}
        color={new THREE.Color(0xffff00)}
        opacity={1.0}
        name={tracks[i]}
      />
    )
    soundwaves.push(wave)
  }

  const Song = withSong(soundwaves, 'take_me_out', 3)
  extend({ Song })

  return (
    <group position={new THREE.Vector3(-3.0, 0.0, 0.0)} ref={groupRef}>
      <Song />
    </group>
  )
}
export { SineField }
