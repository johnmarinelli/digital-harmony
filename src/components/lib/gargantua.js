// from https://codepen.io/ajayns/pen/KKPgxrw
const maxAmp = 250
const minAmp = 150
const numParticles = 100

class Tracks {
  constructor() {
    const numTracks = 15
    this.tracks = []

    for (let i = 0; i < numTracks; ++i) {
      const ratio = i / numTracks

      this.tracks.push({ amp: (maxAmp - minAmp) * ratio + minAmp })
    }
  }
}

const { tracks } = new Tracks()

class Particle {
  constructor() {
    this.init()
  }

  init() {
    // constants
    this.baseAmp = tracks[getRandomInt(0, tracks.length - 1)].amp
    this.rotSpeed = getRandomFloat(0.01, 0.015)
    this.ampSpeed = 1
    this.baseRad = 3
    this.grownAge = 10

    this.age = 0
    this.amp = this.baseAmp
    this.rad = this.baseRad
    this.angle = getRandomFloat(0, Math.PI * 2)
    this.pos = {
      x: 0,
      y: 0,
    }
  }

  updateRadius() {
    let ratio = this.amp / this.baseAmp * 2.5 - 1.5
    this.rad = ratio * this.baseRad
  }

  updatePosition() {
    this.angle += this.rotSpeed
    this.pos.x = vw.center.x + this.amp * Math.cos(this.angle) * 1.2
    this.pos.y = vw.center.y + this.amp * Math.pow(Math.sin(this.angle), 3) * 0.8
  }

  draw() {
    const { pos } = this
    const ageAttack = this.age / this.grownAge
    const rad = this.rad * ageAttack
    const alpha = ageAttack

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, rad, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha}`
    ctx.fill()
  }

  update() {
    if (this.age < this.grownAge) {
      this.age++
    }

    this.amp -= this.ampSpeed
    this.updateRadius()

    if (this.rad > 0) {
      this.updatePosition()
      this.draw()
    } else {
      this.init()
    }
  }
}

class Emitter {
  constructor() {
    this.particles = [...Array(numParticles).keys()].map(() => new Particle())
  }

  update() {
    this.particles.forEach(particle => particle.update())
  }
}

const emitter = new Emitter()
