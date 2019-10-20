import React, { useMemo, useEffect, useState } from 'react'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useLoader } from 'react-three-fiber'

const FBXModel = ({ url }) => {
  const [obj, set] = useState()
  useEffect(
    () =>
      new FBXLoader().load(url, data => {
        set(data)
      }),
    [url]
  )
  return obj ? <primitive object={obj} /> : null
}

const GLTFModel = ({ url }) => {
  const [obj, set] = useState()

  useMemo(() => {
    // 20/10/2019 todo: use https://github.com/react-spring/react-three-fiber#useloaderloader-url-string-string-extensions-experimental
  })
  return obj ? <primitive object={obj} /> : null
}

export { FBXModel, GLTFModel }
