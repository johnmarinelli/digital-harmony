import * as THREE from 'three/src/Three'

const OctahedronStates = [
  /*
  {
    'material-opacity': 0.25,
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
  },
  */
  {
    'material-opacity': 1.0,
    'material-color': 0xc9c9c9,
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
  },
  {
    'material-opacity': 0.5,
    scale: [1.5, 1.5, 1.5],
    rotation: [THREE.Math.degToRad(22.5), 0, THREE.Math.degToRad(22.5)],
  },
  {
    scale: [1.3, 1.3, 1.4],
  },
  {
    'material-opacity': 0.25,
    scale: [1.3, 1.3, 1.3],
    rotation: [THREE.Math.degToRad(30), 0, THREE.Math.degToRad(30)],
  },
  {
    'material-opacity': 0.6,
    scale: [1.5, 1.5, 1.5],
    rotation: [THREE.Math.degToRad(180), 0, THREE.Math.degToRad(45)],
  },
  {
    'material-opacity': 0.9,
    scale: [2, 2, 2],
    rotation: [THREE.Math.degToRad(360), 0, THREE.Math.degToRad(90)],
  },

  {
    'material-opacity': 0.0,
    scale: [0.5, 0.5, 0.5],
    rotation: [THREE.Math.degToRad(0), 0, THREE.Math.degToRad(90)],
    position: [9, 0, 0],
  },
  {
    'material-opacity': 1.0,
    scale: [1.0, 1.0, 1.0],
    rotation: [0, 0, THREE.Math.degToRad(90)],
    position: [0, 0, 0],
  },
]

export default OctahedronStates
