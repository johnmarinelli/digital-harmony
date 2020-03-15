import { ExtendableFloatArray } from './Dependencies'
import { noise } from '../util/Noise'

let TWO_PI = 2 * Math.PI
let angle

let Particle = ExtendableFloatArray()({
  x: 0,
  y: 1,
  r: 2,
  vx: 3,
  vy: 4,
})

function makeParticle() {
  let p = new Particle(5)
  p[0] = 0
  p[1] = 0
  p[2] = 0
  p[3] = 0
  p[4] = 0
  return p
}

class FizzyText {
  constructor(message, w, h, isDark, fontSize) {
    this.growthSpeed = 0.37 // how fast do particles change size?
    this.maxSize = 8 // how big can they get?
    this.noiseStrength = 10 // how turbulent is the flow?
    this.speed = 0.4 // how fast do particles move?
    this.displayOutline = false // should we draw the message as a stroke?
    this.framesRendered = 0

    this.width = w
    this.height = h

    this.fontSize = fontSize || 140
    this.noiseScale = this.noiseScale = 300

    this.color0 = '#00aeff'
    this.color1 = '#0fa954'
    this.color2 = '#54396e'
    this.color3 = '#e61d5f'

    // This is the context we use to get a bitmap of text using
    // the getImageData function.
    this.r = document.createElement('canvas')
    this.s = this.r.getContext('2d')

    // This is the context we actually use to draw.
    this.c = this.domElement = document.createElement('canvas')
    this.c.classList.add('fizzyTextCanvas')
    this.graphics = this.c.getContext('2d')

    this.domElement.width = this.width = this.r.width = this.width
    this.domElement.height = this.height = this.r.height = this.height

    // Stores bitmap image
    this.pixels = []

    // Stores a list of particles
    this.particles = []
    this.effect = 'darker'

    // Set g.font to the same font as the bitmap canvas, incase we
    // want to draw some outlines.
    this.s.font = this.graphics.font = 'bold ' + this.fontSize + 'px Helvetica, Arial, sans-serif'
    this.graphics.globalCompositeOperation = this.effect

    // Instantiate some particles
    for (var i = 0; i < 1200; i++) {
      this.particles.push(makeParticle())
    }

    // Object defineProperty makes JavaScript believe _this
    // we've defined a variable 'this.message'. This way, whenever we
    // change the message variable, we can call some more functions.
    Object.defineProperty(this, 'message', {
      get: function() {
        return message
      },

      set: function(m) {
        message = m
        this.createBitmap(message)
      },
    })
    // This calls the setter we've defined above, so it also calls
    // the createBitmap function.
    this.message = message
  }

  createBitmap(msg) {
    this.s.clearRect(0, 0, this.width, this.height)
    this.s.fillStyle = '#f00'
    this.s.textAlign = this.graphics.textAlign = 'center'
    this.s.textBaseline = this.graphics.textBaseline = 'middle'
    this.s.fillText(msg, this.width / 2, this.height / 2)

    // Pull reference
    var imageData = this.s.getImageData(0, 0, this.width, this.height)
    this.pixels = imageData.data
  }

  render() {
    this.framesRendered++
    this.graphics.clearRect(0, 0, this.width, this.height)

    if (this.displayOutline) {
      this.graphics.globalCompositeOperation = 'source-over'
      this.graphics.strokeStyle = '#000'
      this.graphics.lineWidth = 2.0
      this.graphics.strokeText(this.message, this.width / 2, this.height / 2)
      this.graphics.globalCompositeOperation = this.effect
    }

    var p,
      j,
      l = 4,
      k
    var ll = this.particles.length / l
    var height2 = (this.height2 = this.height / 2),
      fontSize2 = (this.fontSize2 = this.fontSize / 2)

    for (var i = 0; i < l; i++) {
      this.graphics.fillStyle = this['color' + i]
      k = ll * i
      for (j = 0; j < ll; j++) {
        p = this.particles[j + k]
        if (p.update(this)) p.render(this.graphics)
      }
    }
  }

  explode() {
    let mag = 30
    for (let i in this.particles) {
      var angle = Math.random() * TWO_PI
      this.particles[i][3] = Math.cos(angle) * mag
      this.particles[i][4] = Math.sin(angle) * mag
    }
  }

  getColor(x, y) {
    return this.pixels[(~~y * this.width + ~~x) * 4]
  }
}

const initialize = () => {
  Particle.prototype.render = function(g) {
    // Draw the circle.
    g.beginPath()
    g.arc(this[0], this[1], this[2], 0, TWO_PI, false)
    g.fill()
  }

  Particle.prototype.update = function(fizzyText) {
    // Where should we move?
    angle = noise(this[0] / fizzyText.noiseScale, this[1] / fizzyText.noiseScale) * fizzyText.noiseStrength

    // Are we within the boundaries of the image?

    // If we're on top of a black pixel, grow.
    // If not, shrink.
    if (fizzyText.getColor(this[0], this[1]) > 0) {
      this[2] += fizzyText.growthSpeed
    } else {
      this[2] -= fizzyText.growthSpeed
    }

    // This velocity is used by the explode function.
    this[3] *= 0.8
    this[4] *= 0.8

    // Change our position based on the flow field and our
    // explode velocity.
    this[0] += Math.cos(angle) * fizzyText.speed + this[3]
    this[1] -= Math.sin(angle) * fizzyText.speed + this[4]

    if (this[2] > fizzyText.maxSize) {
      this[2] = fizzyText.maxSize
    } else if (this[2] < 0) {
      this[2] = 0
      this[0] = Math.random() * fizzyText.width
      this[1] = fizzyText.height2 + (Math.random() * 2 - 1) * fizzyText.fontSize2
      return false
    }
    return true
  }

  const fizzyText = new FizzyText('"GRANDFATHER"', 800, 150, true, 100)
  setInterval(() => {
    fizzyText.render()
  }, 16.66)

  document.querySelector('.canvasContainer').prepend(fizzyText.domElement)
}

export { FizzyText, initialize as initializeFizzyText }
