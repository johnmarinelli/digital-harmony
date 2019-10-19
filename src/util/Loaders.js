/*
 * Helper file for loading assets
 */

import * as THREE from 'three'
import path from 'path'

/*
 * expects a directory name.
 * the contents of the directory should have normalized names "posX, negX" etc
 * returns THREE.TextureCube
 */
const loadEnvironmentMapUrls = directory => {
  const names = ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']
  const root = '/textures/cube/'
  const urls = names.map(name => path.join(root, directory, name))
  console.log(urls)
  const cubeTexture = new THREE.CubeTextureLoader().load(urls)
  cubeTexture.format = THREE.RGBFormat
  cubeTexture.mapping = THREE.CubeReflectionMapping
  cubeTexture.encoding = THREE.sRGBEncoding

  return cubeTexture
}

export { loadEnvironmentMapUrls }
