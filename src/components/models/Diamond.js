import React from 'react'
import { GLTFModel } from './Model'
import path from 'path'

const baseUrl = path.join('models', 'diamond')
// 20/10/2019 todo
const Diamond = () => <GLTFModel url={path.join(baseUrl, 'DIAMOND.gltf')} />

export { Diamond }
