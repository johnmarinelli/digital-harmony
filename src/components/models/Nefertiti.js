import React, { useRef } from 'react'
import { useRender } from 'react-three-fiber'
import { FBXModel } from './Model'
import path from 'path'

const baseUrl = path.join('models', 'nefertiti')
const Nefertiti = ({ customRenderFn }) => {
  const ref = useRef()
  useRender(() => {
    if (customRenderFn) {
      customRenderFn(ref.current)
    }
  })
  return (
    <group ref={ref}>
      <FBXModel url={path.join(baseUrl, 'nefertiti6.fbx')} />
    </group>
  )
}

export { Nefertiti }
