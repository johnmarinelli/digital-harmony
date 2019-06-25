import * as THREE from 'three/src/Three'
const states = [
  {
    trigger: [60, 61],
    octahedron: {
      'material-opacity': 0.25,
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      position: [0, 0, 0],
    },
    lines: {
      'material-color': 'white',
      position: [0, 0, 0],
    },
    tetrahedrons: {
      'material-opacity': 0.0,
      scale: [0.2, 0.2, 0.2],
      rotation: [THREE.Math.degToRad(45), THREE.Math.degToRad(45), THREE.Math.degToRad(45)],
    },
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 },
  },

  {
    trigger: [62, 63],
    octahedron: {
      'material-opacity': 0.55,
      scale: [1.1, 1.1, 1.1],
      rotation: [THREE.Math.degToRad(30), 0, THREE.Math.degToRad(20)],
    },
    lines: {
      position: [0, 0, 0.2],
    },
  },

  {
    trigger: [64, 65],
    octahedron: {
      scale: [1.3, 1.3, 1.4],
    },
    lines: {
      position: [0, 0, 0.25],
    },
  },

  {
    trigger: [66, 67],
    octahedron: {
      'material-opacity': 0.25,
      scale: [1.3, 1.3, 1.3],
      rotation: [THREE.Math.degToRad(30), 0, THREE.Math.degToRad(30)],
    },
    lines: {
      'material-color': 'blue',
      position: [0, 0, 0.2],
    },
  },
  {
    trigger: [68, 69],
    octahedron: {
      'material-opacity': 0.6,
      scale: [1.5, 1.5, 1.5],
      rotation: [THREE.Math.degToRad(180), 0, THREE.Math.degToRad(45)],
    },
    lines: {
      'material-color': 'hotpink',
      position: [0, 0, 2],
    },
  },
  {
    trigger: [70, 71],
    octahedron: {
      'material-opacity': 0.9,
      scale: [2, 2, 2],
      rotation: [THREE.Math.degToRad(360), 0, THREE.Math.degToRad(90)],
    },
    lines: {
      'material-color': 'green',
      position: [0, 0, 1],
    },
  },
  {
    trigger: [72, 73],
    octahedron: {
      'material-opacity': 0.0,
      scale: [0.5, 0.5, 0.5],
      rotation: [THREE.Math.degToRad(0), 0, THREE.Math.degToRad(90)],
      position: [9, 0, 0],
    },
    lines: {
      'material-color': 'purple',
      position: [0, 0, 1.5],
      scale: [0.75, 0.75, 0.75],
    },
    tetrahedrons: {
      'material-opacity': 1.0,
    },
  },
  {
    trigger: [74, 75],
    octahedron: {
      'material-opacity': 1.0,
      scale: [1.0, 1.0, 1.0],
      rotation: [0, 0, THREE.Math.degToRad(90)],
      position: [0, 0, 0],
    },
    lines: {
      'material-color': 'green',
      position: [0, 0, 1],
    },
    tetrahedrons: {
      'material-opacity': 1.0,
    },
  },
]

export default states
