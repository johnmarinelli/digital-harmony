import React, { useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
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

  useEffect(
    () => {
      // 20/10/2019 todo: use https://github.com/react-spring/react-three-fiber#useloaderloader-url-string-string-extensions-experimental
      const loader = new GLTFLoader().load(url, gltf => {
        set(gltf)
      })
    },
    [url]
  )
  return obj ? <primitive object={obj} /> : null
}

/*
const OBJModel = ({ url }) => {
  const [obj, set] = useState()

  useEffect(() => {
    new OBJLoader().load(url, data => {
      set(data)
    })
  })

  return obj ? <primitive object={obj} /> : null
}
*/

export { FBXModel, GLTFModel }
