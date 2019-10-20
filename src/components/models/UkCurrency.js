import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import { FBXModel } from './Model'
import path from 'path'

const baseUrl = path.join('models', 'uk_currency')
const FiftyNote = () => {
  const ref = useRef()
  useRender(() => {
    ref.current.rotation.y += 0.01
  })
  return (
    <group ref={ref}>
      <FBXModel url={path.join(baseUrl, 'Fifty.fbx')} />
    </group>
  )
}

export { FiftyNote }
