import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import { FBXModel } from './Model'
import path from 'path'

const baseUrl = path.join('models', 'nefertiti')
const Nefertiti = () => {
  const ref = useRef()
  useRender(() => {
    ref.current.rotation.y += 0.01
  })
  return (
    <group ref={ref}>
      <FBXModel url={path.join(baseUrl, 'nefertiti2.fbx')} />
    </group>
  )
}

export { Nefertiti }
