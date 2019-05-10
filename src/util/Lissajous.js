import GuiOptions from '../components/Gui'

class LissajousKnot {
  constructor({ numPoints, pointRatio }) {
    this.pointRatio = pointRatio
    this.numPoints = numPoints
    this.points = new Array(numPoints)
    this.updatePoints = this.updatePoints.bind(this)
    this.update = this.update.bind(this)

    this.updatePoints(0)
  }

  updatePoints(dt) {
    const { numPoints, points, pointRatio } = this
    const { nX, nY, nZ, phaseShift1, phaseShift2, phaseShift3 } = GuiOptions.options
    for (let i = 0; i < numPoints; ++i) {
      points[i] = LissajousKnot.getPoint(i * pointRatio, nX, nY, nZ, phaseShift1, phaseShift2, phaseShift3)
    }
  }

  static getPoint(t, nX, nY, nZ, phaseShift1, phaseShift2, phaseShift3) {
    const x = Math.cos(nX * t + phaseShift1),
      y = Math.cos(nY * t + phaseShift2),
      z = Math.cos(nZ * t + phaseShift3)

    return [x, y, z]
  }

  update(dt) {
    this.updatePoints(dt)
  }
}

class LissajousTrail {
  constructor({ numParticles }) {
    this.numParticles = numParticles
    // array of 3d arrays
    this.particles = []
    this.stepMode = 'continuous'
    this.cycleTime = 10

    for (let i = 0; i < this.numParticles; ++i) {
      this.particles.push({})
    }
  }

  attachKnot(knot) {
    this.knot = knot
  }

  setCycleTime(seconds) {
    this.cycleTime = seconds
  }

  setStepMode(stepMode) {
    if (['discrete', 'continuous'].indexOf(stepMode) > -1) {
      this.stepMode = stepMode
    } else {
      console.warn(`Step mode "${stepMode}" for LissajousTrail is invalid.  Use either "discrete" or "continuous"`)
    }
  }

  update(elapsed) {
    const { numParticles, particles, stepMode } = this
    const { nX, nY, nZ, phaseShift1, phaseShift2, phaseShift3 } = GuiOptions.options
    if (stepMode === 'continuous') {
      for (let i = numParticles - 1; i >= 0; --i) {
        const point = LissajousKnot.getPoint(elapsed + i, nX, nY, nZ, phaseShift1, phaseShift2, phaseShift3)
        particles[i] = point
      }
    } else {
      const { knot, cycleTime } = this
      const { numPoints } = knot
      const cyclePercentage = (elapsed / cycleTime) % 1.0
      const basePointIndex = Math.floor(cyclePercentage * numPoints)

      for (let i = numParticles - 1; i >= 0; --i) {
        const pointIndex = (basePointIndex + i) % knot.points.length
        particles[i] = knot.points[pointIndex]
      }
    }
  }
}

export { LissajousKnot, LissajousTrail }
