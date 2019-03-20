import * as THREE from 'three/src/Three'
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
