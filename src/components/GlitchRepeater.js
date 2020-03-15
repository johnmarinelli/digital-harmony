import React, { useMemo, useRef } from 'react'
import { animated as anim } from 'react-spring/three'
import clock from '../util/Clock'
import * as THREE from 'three'
import { useRender } from 'react-three-fiber'

const GlitchRepeater = ({
  mesh,
  position,
  numRepeats,
  frameBreak,
  updateFn,
  wireframe = false,
  extraRenderFunction = null,
}) => {
  const groupRef = useRef()
  mesh = mesh || new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }))
  numRepeats = numRepeats || 25
  frameBreak = frameBreak || 10

  if (!updateFn || typeof updateFn !== 'function') {
    updateFn = now => [Math.sin(now), Math.cos(now), Math.sin(now)]
  }

  let numFrames = 0

  const [geometries] = useMemo(
    () => {
      const geometries = new Array(numRepeats)

      for (let i = 0; i < numRepeats; ++i) {
        geometries[i] = mesh.geometry.clone()
      }

      return [geometries]
    },
    [mesh]
  )

  useRender(() => {
    const now = clock.getElapsedTime()
    const [x, y, z] = updateFn(now)
    const children = groupRef.current.children
    const main = children[0]

    // like numFrames % 8 === 0, but cheaper
    // this is what staggers the animation.
    // it determines the space between each "repeat".
    if ((numFrames & 7) === 0) {
      for (let i = children.length - 1; i > 0; --i) {
        let current = children[i]
        let next = children[i - 1]

        current.position.x = next.position.x
        current.position.y = next.position.y
        current.position.z = next.position.z

        const scale = (children.length - i) / children.length
        current.scale.x = scale
        current.scale.y = scale
        current.scale.z = scale

        current.rotation.x = next.rotation.x
        current.rotation.y = next.rotation.y
        current.rotation.z = next.rotation.z
      }
    }

    main.position.x = x
    main.position.y = y
    main.position.z = z

    main.rotation.x += 0.01
    main.rotation.z += 0.005

    if (extraRenderFunction != null) {
      extraRenderFunction(groupRef.current)
    }

    numFrames++
  })

  position = position || new THREE.Vector3(0.0, 0.0, 0.0)
  const repeaterProps = wireframe
    ? {
        wireframe,
        color: 'purple',
      }
    : {}

  return (
    <group position={position} ref={groupRef}>
      <anim.mesh geometry={mesh.geometry}>
        {wireframe ? (
          <anim.lineBasicMaterial attach="material" transparent color="pink" />
        ) : (
          <anim.meshBasicMaterial attach="material" transparent color="pink" />
        )}
      </anim.mesh>
      {geometries.map((geometry, i) => {
        return (
          <anim.mesh key={i} geometry={geometry}>
            {wireframe ? (
              <anim.lineBasicMaterial
                attach="material"
                color={Math.random() * 0xffffff}
                transparent
                {...repeaterProps}
              />
            ) : (
              <anim.meshBasicMaterial
                attach="material"
                color={Math.random() * 0xffffff}
                transparent
                {...repeaterProps}
              />
            )}
          </anim.mesh>
        )
      })}
    </group>
  )
}
export { GlitchRepeater }
