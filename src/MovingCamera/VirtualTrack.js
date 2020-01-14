import React from 'react'
import * as THREE from 'three'

const VirtualTrackComponent = props => {
  const { path } = props
  return (
    <mesh>
      <tubeBufferGeometry args={[path, 100, 1, 3, false]} attach="geometry" />
      <meshBasicMaterial color={0xf0f0f0} opacity={0.3} wireframe transparent attach="material" />
    </mesh>
  )
}

/*
 * A "VirtualTrack" is a set of points that will be used as a Camera track
 * (eg, the path for the camera to follow),
 * or as a LookAt track (the path for the lookAt vector to follow)
 * Think of in Hollywood, when they create a scrolling scene of the character
 * walking with a camera mounted on a small machine.
 * The machine moves along a track.
 */
class VirtualTrack {
  /*
   * controlPoints example: [
   *   new THREE.Vector3(0, 0, 0),
   *   new THREE.Vector3(0, 0, -50),
   *   new THREE.Vector3(0, 0, -100),
   * ]
   */
  constructor(controlPoints) {
    this.trackSpline = new THREE.CatmullRomCurve3(controlPoints)
    this.trackLength = this.trackSpline.getLength()
    this.trackCounter = 0.0
    this.trackGeometry = new THREE.TubeBufferGeometry(this.trackSpline, 100, 3, 3, false)
  }

  updateTrackCounter(d) {
    this.trackCounter += d
    this.trackCounter = Math.min(Math.max(this.trackCounter, 0.0), this.trackLength)
  }

  setTrackCounter(counter) {
    this.trackCounter = counter
  }

  reset() {
    this.trackCounter = 0.0
  }
}

export { VirtualTrack, VirtualTrackComponent }
