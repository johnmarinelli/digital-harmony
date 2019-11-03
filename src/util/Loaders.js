/*
 * Helper file for loading assets
 */

import * as THREE from 'three'
import path from 'path'
import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator'
import { PMREMCubeUVPacker } from 'three/examples/jsm/pmrem/PMREMCubeUVPacker'
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader'

/*
 * expects a directory name and a list of filenames
 * returns THREE.TextureCube
 */
const loadEnvironmentMapUrls = (directory, names) => {
  const root = '/textures/cube/'
  const urls = names.map(name => path.join(root, directory, name))
  const cubeTexture = new THREE.CubeTextureLoader().load(urls)
  cubeTexture.format = THREE.RGBFormat
  cubeTexture.mapping = THREE.CubeReflectionMapping
  cubeTexture.encoding = THREE.sRGBEncoding

  return cubeTexture
}

/*
 * same as above, but returns an HDR cube for PBR
*/
const loadHDREnvironmentMap = (directory, names, renderer) => {
  const hdrCubeTexture = new HDRCubeTextureLoader()
    .setPath(`/textures/cube/${directory}/`)
    .setDataType(THREE.UnsignedByteType)
    .load(names, () => {
      const pmremGenerator = new PMREMGenerator(hdrCubeTexture)
      pmremGenerator.update(renderer)

      const pmremCubeUVPacker = new PMREMCubeUVPacker(pmremGenerator.cubeLods)
      pmremCubeUVPacker.update(renderer)

      hdrCubeTexture.magFilter = THREE.LinearFilter
      hdrCubeTexture.needsUpdate = true

      pmremGenerator.dispose()
      pmremCubeUVPacker.dispose()
    })

  return hdrCubeTexture
}

const loadVideoAsTexture = (videoElement, opts) => {
  const texture = new THREE.VideoTexture(videoElement)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.format = THREE.RGBFormat

  return texture
}

export { loadEnvironmentMapUrls, loadHDREnvironmentMap, loadVideoAsTexture }
