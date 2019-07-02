import * as THREE from 'three/src/Three'

const SquareOutlineStates = [
  {
    'material-color': 'white',
    position: [0, 0, 0],
  },
  {
    position: [0, 0, 0.2],
  },
  {
    position: [0, 0, 0.25],
  },
  {
    'material-color': 'blue',
    position: [0, 0, 0.2],
  },
  {
    'material-color': 'hotpink',
    position: [0, 0, 2],
  },
  {
    'material-color': 'green',
    position: [0, 0, 1],
  },
  {
    'material-color': 'purple',
    position: [0, 0, 1.5],
    scale: [0.75, 0.75, 0.75],
  },
  {
    'material-color': 'green',
    position: [0, 0, 1],
  },
]

const OctahedronStates = [
  {
    'material-opacity': 0.25,
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
  },
  {
    'material-opacity': 0.55,
    scale: [1.1, 1.1, 1.1],
    rotation: [THREE.Math.degToRad(30), 0, THREE.Math.degToRad(20)],
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

const TetrahedronsStates = [
  {
    'material-opacity': 0.0,
    scale: [0.2, 0.2, 0.2],
    rotation: [THREE.Math.degToRad(45), THREE.Math.degToRad(45), THREE.Math.degToRad(45)],
  },
  {},
  {},
  {},
  {},
  {},
  {
    'material-opacity': 1.0,
  },
  {
    'material-opacity': 0.5,
  },
]

const states = [
  {
    trigger: [60, 61],
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 },
  },

  {
    trigger: [62, 63],
  },

  {
    trigger: [64, 65],
  },

  {
    trigger: [66, 67],
  },
  {
    trigger: [68, 69],
  },
  {
    trigger: [70, 71],
  },
  {
    trigger: [72, 73],
  },
  {
    trigger: [74, 75],
  },
]

export { SquareOutlineStates, OctahedronStates, TetrahedronsStates }
export default states
