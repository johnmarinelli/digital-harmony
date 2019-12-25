import React, { useEffect, useRef } from 'react'
import { useRender } from 'react-three-fiber'
import { useSprings, animated } from 'react-spring/three'
import clock from '../util/Clock'
import * as THREE from 'three'

const CUBE_SIZE = 1 /* width, height */
const GRID = 4 /* cols, rows */
const TOTAL_CUBES = GRID * GRID
const WALL_SIZE = CUBE_SIZE * GRID
const HALF_WALL_SIZE = WALL_SIZE / 2
const MAIN_COLOR = 0xffffff
const SECONDARY_COLOR = 0x222222
const PI = Math.PI

const colors = ['#441151', '#883677', '#CA61C3', '#EE85B5', '#FF958C']

const randomAngle = () => THREE.Math.degToRad(Math.round(Math.random()) * (Math.random() < 0.5 ? -360 : 360))

const random = () => {
  return {
    color: colors[Math.round(Math.random() * (colors.length - 1))],
    rotation: [randomAngle(), 0, 0],
  }
}

const Floor = () => {
  const tilesArray = []
  const geometry = new THREE.BoxBufferGeometry(WALL_SIZE, WALL_SIZE, 0.05)
  const material = new THREE.MeshPhongMaterial({
    color: MAIN_COLOR,
  })

  for (let i = 0; i < 8; i++) {
    tilesArray.push(new THREE.Mesh(geometry, material))
  }

  tilesArray[0].position.set(-WALL_SIZE, WALL_SIZE, 0)
  tilesArray[1].position.set(0, WALL_SIZE, 0)
  tilesArray[2].position.set(WALL_SIZE, WALL_SIZE, 0)
  tilesArray[3].position.set(-WALL_SIZE, 0, 0)
  tilesArray[4].position.set(WALL_SIZE, 0, 0)
  tilesArray[5].position.set(-WALL_SIZE, -WALL_SIZE, 0)
  tilesArray[6].position.set(0, -WALL_SIZE, 0)
  tilesArray[7].position.set(WALL_SIZE, -WALL_SIZE, 0)

  tilesArray.forEach(function(tile) {
    tile.receiveShadow = true
  })

  return (
    <group>
      {tilesArray.map((tile, i) => {
        return <primitive object={tile} key={i} />
      })}
    </group>
  )
}
const Well = () => {
  const boxes = []

  const geometry = new THREE.BoxGeometry(WALL_SIZE, WALL_SIZE, 0.05)
  geometry.faces[8].color.setHex(SECONDARY_COLOR)
  geometry.faces[9].color.setHex(SECONDARY_COLOR)
  geometry.colorsNeedUpdate = true
  const material = new THREE.MeshBasicMaterial({ color: MAIN_COLOR, vertexColors: THREE.FaceColors })

  for (let i = 0; i < 5; ++i) {
    boxes.push(new THREE.Mesh(geometry, material))
  }

  // back
  boxes[0].position.set(0, HALF_WALL_SIZE, -HALF_WALL_SIZE)
  boxes[0].rotation.x = 90 * (PI / 180)

  // right
  boxes[1].position.set(HALF_WALL_SIZE, 0, -HALF_WALL_SIZE)
  boxes[1].rotation.y = -90 * (PI / 180)

  // front
  boxes[2].position.set(0, -HALF_WALL_SIZE, -HALF_WALL_SIZE)
  boxes[2].rotation.x = -90 * (PI / 180)

  // left
  boxes[3].position.set(-HALF_WALL_SIZE, 0, -HALF_WALL_SIZE)
  boxes[3].rotation.y = 90 * (PI / 180)

  // bottom
  boxes[4].position.set(0, 0, -WALL_SIZE)

  return <group>{boxes.map((box, i) => <primitive object={box} key={i} />)}</group>
}

const Lights = props => {
  const lightAPosition = props.lightAPosition || [-WALL_SIZE, 2, 1]
  const lightBPosition = props.lightBPosition || [WALL_SIZE, WALL_SIZE, 1]

  const lightScale = [0.15, 0.15, 0.15]

  const lightARef = useRef()
  const lightBRef = useRef()

  useRender(() => {
    const now = clock.getElapsedTime()
    const { current: lightA } = lightARef
    const { current: lightB } = lightARef

    if (lightA && lightB) {
      //lightA.position.x += Math.sin(now) * 0.025
      //lightA.position.z += Math.cos(now) * 0.025
    }
  })

  return (
    <group>
      <group position={lightAPosition} ref={lightARef}>
        <directionalLight color={MAIN_COLOR} intensity={1} castShadow />
        <mesh scale={lightScale}>
          <boxGeometry attach="geometry" />
          <meshBasicMaterial color={0xffffff} attach="material" />
        </mesh>
      </group>
      <group position={lightBPosition} ref={lightBRef}>
        <directionalLight color={MAIN_COLOR} intensity={1.2} />
        <mesh scale={lightScale}>
          <boxGeometry attach="geometry" />
          <meshBasicMaterial color={0xababab} attach="material" />
        </mesh>
      </group>
    </group>
  )
}

const Tiles = props => {
  const rotation = props.rotation || [0, 0, 0]
  const minDuration = 3,
    maxDuration = 6,
    minDelay = 0.5,
    maxDelay = 6,
    attrOptions = ['x', 'y']
  let x, y, row, col

  let cubes = new Array(TOTAL_CUBES).fill(null)
  x = 0
  y = 0
  row = 0
  col = 0

  const [springs, set] = useSprings(cubes.length, i => ({
    from: random(),
    ...random(),
    config: { mass: 20, tension: 500, friction: 200 },
  }))

  useEffect(() => void setInterval(() => set(i => ({ ...random(), delay: (i + 1) * 50 })), 2000), [])
  for (let i = 0; i < TOTAL_CUBES; ++i) {
    if (i % GRID === 0) {
      col = 1
      row++
    } else {
      col++
    }

    x = -(GRID * CUBE_SIZE / 2 - CUBE_SIZE * col + CUBE_SIZE / 2)
    y = -(GRID * CUBE_SIZE / 2 - CUBE_SIZE * row + CUBE_SIZE / 2)

    const spring = springs[i]
    const { rotation, color } = spring
    const bumpMap = new THREE.TextureLoader().load(`/textures/circle.png`)

    cubes[i] = (
      <animated.mesh position={[x, y, 0]} rotation={rotation} key={i} castShadow receiveShadow>
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, 0.05]} attach="geometry" />
        <animated.meshPhongMaterial color={0xffffff} bumpMap={bumpMap} attach="material" />
      </animated.mesh>
    )
  }
  return <group rotation={rotation}>{cubes}</group>
}

const FlippantSquares = () => {
  const rotation = [-60 * (PI / 180), 0, -45 * (PI / 180)]
  return (
    <group position={[0, -2.0, 0]}>
      <group rotation={rotation}>
        {/*
        <Well />
        <Lights lightAPosition={[0, 2, 2]} lightBPosition={[0, 0, -100]} />
        */}
        <Floor />
        <Tiles />
      </group>
    </group>
  )
}

export { FlippantSquares }
