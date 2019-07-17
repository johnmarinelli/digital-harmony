import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three/src/Three'

class TurtleGraphics {
  constructor({ thetaDegrees = 0, startPoint = new THREE.Vector3(0, 0, 0) }) {
    this.scale = 0.25
    this.vectorDelta = new THREE.Vector3(this.scale, this.scale, 0)
    this.axisX = new THREE.Vector3(1, 0, 0)
    this.axisY = new THREE.Vector3(0, 1, 0)
    this.axisZ = new THREE.Vector3(0, 0, 1)
    this.angle = THREE.Math.degToRad(90)
    this.endPoint = new THREE.Vector3(0, 0, 0)
    this.startPoint = startPoint
    this.geometry = new THREE.Geometry()

    this.lineSegments = []

    this.prevStartPoint = this.startPoint.clone()

    this.theta = THREE.Math.degToRad(thetaDegrees)
    this.stackVectors = []
    this.stackAngles = []
  }

  moveForward() {
    let axis = this.vectorDelta.clone().applyAxisAngle(this.axisY, this.angle)
    this.endPoint.addVectors(this.startPoint, axis)
    this.geometry.vertices.push(this.startPoint.clone())
    this.geometry.vertices.push(this.endPoint.clone())

    this.prevStartPoint.copy(this.startPoint)
    this.startPoint.copy(this.endPoint)
  }

  rotateRight() {
    this.angle += this.theta
  }

  rotateLeft() {
    this.angle -= this.theta
  }

  saveState() {
    const { startPoint, angle } = this
    this.stackVectors.push(new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z))
    this.stackAngles[this.stackAngles.length] = angle
  }

  popState() {
    const point = this.stackVectors.pop()
    this.startPoint.copy(new THREE.Vector3(point.x, point.y, point.z))
    this.angle = this.stackAngles.pop()
  }

  clear() {
    this.geometry.dispose()
  }
}

class LSystem {
  constructor({
    sentence = 'F',
    rules = [
      {
        a: 'F',
        b: 'FF+[+F-F-F]-[-F+F+F]',
      },
    ],
    thetaDegrees = 0,
    startPoint = new THREE.Vector3(0, 0, 0),
  }) {
    this.originalSentence = sentence
    this.sentence = sentence
    this.rules = rules

    this.turtleGraphics = new TurtleGraphics({ thetaDegrees, startPoint })
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

  getGeometry() {
    return this.turtleGraphics.geometry
  }

  turtle() {
    for (let i = 0; i < this.sentence.length; ++i) {
      const current = this.sentence.charAt(i)

      if (current === 'F') {
        this.turtleGraphics.moveForward()
      } else if (current === '+') {
        // rotate by PI / 6
        this.turtleGraphics.rotateRight()
      } else if (current === '-') {
        // rotate by - PI / 6
        this.turtleGraphics.rotateLeft()
      } else if (current === '[') {
        // save transformation state
        this.turtleGraphics.saveState()
      } else if (current === ']') {
        // pop transformation state
        this.turtleGraphics.popState()
      }
    }
  }

  clear() {
    this.sentence = this.originalSentence
    this.turtleGraphics.clear()
  }
}

export default LSystem
