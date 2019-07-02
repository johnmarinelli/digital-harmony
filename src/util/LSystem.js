import * as THREE from 'three'

class TurtleGraphics {
  constructor() {
    this.vertices = []
    this.currentLocation = new THREE.Vector3(0, 0, 0)
  }

  moveForward() {
    const lastVertex = this.vertices[this.vertices.length - 1]
    this.vertices.push(new THREE.Vector3(lastVertex.x, lastVertex.y + 0.5, lastVertex.z))
    this.currentLocation = this.vertices[this.vertices.length - 1]
  }

  rotateRight() {}

  rotateLeft() {}

  saveState() {}

  popState() {}
}

class LSystem {
  constructor() {
    this.axiom = 'F'
    this.rules = [
      {
        a: 'F',
        b: 'FF+[+F-F-F]-[-F+F+F]',
      },
    ]

    this.sentence = 'F'
  }

  step() {
    let nextSentence = ''
    for (let i = 0; i < this.sentence.length; ++i) {
      const current = this.sentence.charAt(i)
      const ruleFound = false
      for (let j = 0; j < this.rules.length; ++j) {
        const rule = this.rules[j]
        if (current === rule.a) {
          nextSentence += rule.b
          ruleFound = true
          break
        }
      }

      if (!ruleFound) {
        nextSentence += current
      }
    }

    this.sentence = nextSentence
    return this.sentence
  }

  turtle() {
    for (let i = 0; i < this.sentence.length; ++i) {
      const current = this.sentence.charAt(i)

      if (current === 'F') {
        // draw a line "forward"
      } else if (current === '+') {
        // rotate by PI / 6
      } else if (current === '-') {
        // rotate by - PI / 6
      } else if (current === '[') {
        // save transformation state
      } else if (current === ']') {
        // pop transformation state
      }
    }
  }
}

export default LSystem
