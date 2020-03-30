import * as THREE from 'three'
import GuiOptions from '../components/Gui'

const limitVector = (v, max) => (v.length() > max ? v.normalize().multiplyScalar(max) : v)

// this is a data-only class.
// the rendering is done by the caller.
class Boid {
  constructor(opts = {}) {
    this.position = opts.position || new THREE.Vector3(THREE.Math.randFloat(-2, 2), THREE.Math.randFloat(-1, 1), 0)
    this.velocity =
      opts.velocity ||
      new THREE.Vector3(
        THREE.Math.randFloat(-0.001, 0.001),
        THREE.Math.randFloat(-0.001, 0.001),
        THREE.Math.randFloat(-0.001, 0.001)
      )
    this.acceleration = opts.acceleration || new THREE.Vector3(0, 0, 0)
    this.mass = opts.mass || 20
    this.home = opts.home || new THREE.Vector3(0, 0, 0)
    this.pointAt = this.home.clone()
  }
  // Separation Function (personal space)
  separate(flock) {
    let minRange = 0.2
    let currBoid
    let total = new THREE.Vector3(0, 0, 0)
    let count = 0
    // Find total weight of separation
    for (let i = 0; i < flock.length; i++) {
      currBoid = flock[i]
      let dist = this.position.distanceTo(currBoid.position)
      // Apply weight if too close
      if (dist < minRange && dist > 0) {
        let force = this.position.clone()
        force.sub(currBoid.position)
        force.normalize()
        force.divideScalar(dist)
        total.add(force)
        count++
      }
    }
    // Average out total weight
    if (count > 0) {
      total.divideScalar(count)
      total.normalize()
    }
    return total
  }

  // add all forces
  accumulate(flock) {
    let separation, alignment, cohesion, centering
    separation = this.separate(flock).multiplyScalar(0.02 * this.mass)
    alignment = this.align(flock).multiplyScalar(0.05)
    cohesion = this.cohesion(flock).multiplyScalar(0.01)
    centering = this.steer(this.home).multiplyScalar(0.001)
    centering.multiplyScalar(
      this.position.distanceTo(this.home) * this.mass * GuiOptions.options.flockingCenteringFactor
    )
    this.acceleration.add(separation)
    this.acceleration.add(alignment)
    this.acceleration.add(cohesion)
    this.acceleration.add(centering)
    this.acceleration.divideScalar(this.mass)
  }

  step(flock) {
    this.accumulate(flock)
    this.update()
  }

  setHome(newHome) {
    this.home = newHome.clone()
  }

  // Alignment Function (follow neighbours)
  align(flock) {
    let neighborRange = 1
    let currBoid
    let total = new THREE.Vector3(0, 0, 0)
    let count = 0
    // Find total weight for alignment
    for (let i = 0; i < flock.length; i++) {
      currBoid = flock[i]
      let dist = this.position.distanceTo(currBoid.position)
      // Apply force if near enough
      if (dist < neighborRange && dist > 0) {
        total.add(currBoid.velocity)
        count++
      }
    }
    // Average out total weight
    if (count > 0) {
      total.divideScalar(count)
      total = limitVector(total, 1)
    }
    return total
  }

  // Cohesion Function (follow whole flock)
  cohesion(flock) {
    let neighborRange = 0.3
    let currBoid
    let total = new THREE.Vector3(0, 0, 0)
    let count = 0
    // Find total weight for cohesion
    for (let i = 0; i < flock.length; i++) {
      currBoid = flock[i]
      let dist = this.position.distanceTo(currBoid.position)
      // Apply weight if near enough
      if (dist < neighborRange && dist > 0) {
        total.add(currBoid.position)
        count++
      }
    }
    // Average out total weight
    if (count > 0) {
      total.divideScalar(count)
      // Find direction to steer with
      return this.steer(total)
    } else {
      return total
    }
  }

  steer(target) {
    let steer = new THREE.Vector3(0, 0, 0)
    let des = new THREE.Vector3().subVectors(target, this.position)
    let dist = des.length()
    if (dist > 0) {
      des.normalize()
      steer.subVectors(des, this.velocity)
    }
    return steer
  }
  // Update Movement Vectors
  update() {
    this.velocity.add(this.acceleration)
    this.position.add(this.velocity)
    this.acceleration.set(0, 0, 0) // reset each iteration
  }
}

const generateBoids = num => {
  const boids = []
  for (let i = 0; i < num; ++i) {
    const boid = new Boid()
    boids.push(boid)
  }
  return boids
}

export { generateBoids }
