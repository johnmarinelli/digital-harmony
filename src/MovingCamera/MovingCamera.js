import * as THREE from 'three'
import { VirtualTrack } from './VirtualTrack'
/*
example tracks: {
  camera: new VirtualTrack(
    [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -50),
      new THREE.Vector3(20, 10, -101),
      new THREE.Vector3(50, 30, -110),
      new THREE.Vector3(70, 70, -150),
    ],
  ),
  lookAt: new VirtualTrack(
    [
      new THREE.Vector3(0, 0, -50),
      new THREE.Vector3(10, 0, -100),
      new THREE.Vector3(30, 10, -110),
      new THREE.Vector3(60, 30, -110),
      new THREE.Vector3(80, 50, -130),
      new THREE.Vector3(100, 70, -150),
    ],
  ),
}
*/
class MovingCamera {
  constructor(camera, tracks) {
    this.camera = camera
    this.tracks = tracks
  }

  update = dt => {
    const { camera } = this
    const { camera: cameraTrack, lookAt: lookAtTrack } = this.tracks
    const { trackGeometry, trackLength, trackCounter } = cameraTrack
    const {
      trackGeometry: lookAtTrackGeometry,
      //trackLength: lookAtTrackLength,
      //trackCounter: lookAtTrackCounter,
    } = lookAtTrack

    cameraTrack.updateTrackCounter(0.1)
    lookAtTrack.updateTrackCounter(0.1)

    let t = Math.min(0.99, trackCounter / trackLength)
    let pos = trackGeometry.parameters.path.getPointAt(t)
    pos.multiplyScalar(this.scale)

    // todo: figure out wtf this is doing,
    // and refactor it
    // interpolation
    let segments = trackGeometry.tangents.length
    let pickt = t * segments
    let pick = Math.floor(pickt)
    let pickNext = (pick + 1) % segments

    this.binormal.subVectors(trackGeometry.binormals[pickNext], trackGeometry.binormals[pick])
    this.binormal.multiplyScalar(pickt - pick).add(trackGeometry.binormals[pick])

    let dir = trackGeometry.parameters.path.getTangentAt(t)
    let offset = 1

    this.normal.copy(this.binormal).cross(dir)
    // somehow the y value becomes negative,
    // and flips the fpsCamera upside down (180deg on z axis)
    // so we revert the sign here
    this.normal.y = -this.normal.y

    pos.add(this.normal.clone().multiplyScalar(offset))
    camera.position.copy(pos)

    //let lookAtT = lookAtTrackCounter / lookAtTrackLength
    let lookAtT = t

    let lookAtSegments = lookAtTrackGeometry.tangents.length
    let lookAtPickT = lookAtT * lookAtSegments
    let lookAtPick = Math.floor(lookAtPickT)
    let lookAtPickNext = (lookAtPick + 1) % segments
    this.lookAtBinormal.subVectors(
      lookAtTrackGeometry.binormals[lookAtPickNext],
      lookAtTrackGeometry.binormals[lookAtPick]
    )
    this.lookAtBinormal.multiplyScalar(lookAtPickT - lookAtPick).add(lookAtTrackGeometry.binormals[lookAtPick])
    let lookAtDir = lookAtTrackGeometry.parameters.path.getTangentAt(lookAtT)
    this.lookAtNormal
      .copy(this.lookAtBinormal)
      .cross(lookAtDir)
      .multiplyScalar(-1)

    let lookAt = lookAtTrackGeometry.parameters.path
      .getPointAt((lookAtT + 1 / lookAtTrackGeometry.parameters.path.getLength()) % 1)
      .multiplyScalar(this.scale)

    camera.matrix.lookAt(camera.position, lookAt, this.lookAtNormal)
    camera.rotation.setFromRotationMatrix(camera.matrix, camera.rotation.order)
  }
}

export { MovingCamera }
