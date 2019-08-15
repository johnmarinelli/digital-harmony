import React from 'react'
import * as THREE from 'three'
import LSystem from '../../util/LSystem'

const Tree = () => {
  const lsystem = new LSystem({
    /*
    sentence: 'F',
    rules: [
      {
        a: 'F',
        b: 'F[+FF][-FF]F[-F][+F]F',
      },
    ],
    thetaDegrees: 35,
    */
    sentence: 'Z[+Z][-Z][Z]',
    rules: [
      {
        a: 'F',
        b: 'FF',
      },
      {
        a: 'X',
        b: 'F[-X][+X]FXY',
      },
      {
        a: 'Z',
        b: 'X[-X][+X]',
      },
      {
        a: 'Y',
        b: 'F[+X][-X]FFY',
      },
    ],
    thetaDegrees: 30,
    startPoint: new THREE.Vector3(0, -100, 0),
  })
  const numIters = 9
  for (let i = 0; i < numIters; ++i) {
    lsystem.step()
  }
  lsystem.turtle()

  const geometry = lsystem.getGeometry()
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial attach="material" color="red" />
    </lineSegments>
  )
}

export default Tree
