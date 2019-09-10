import * as THREE from 'three/src/Three'

// https://threejs.org/docs/#api/en/core/Clock
class ClockImpl {
  constructor() {
    if (this.instance) {
      return this.instance
    }
    this.instance = this

    this.clock = new THREE.Clock()
  }
}

const clock = new ClockImpl().clock
export default clock
