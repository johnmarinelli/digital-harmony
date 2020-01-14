import React, { useEffect } from 'react'
import * as THREE from 'three'
import { useSprings, animated } from 'react-spring/three'
import { DEG_TO_RAD, TAU, SQRT3 } from '../../util/Constants.js'

const HexagonShape = props => {
  const cellSize = props || 1.0
  let vertices = [],
    angle = 0,
    vertex = null

  for (let i = 0; i < 6; ++i) {
    angle = TAU / 6.0 * i
    vertex = new THREE.Vector3(cellSize * Math.cos(angle), cellSize * Math.sin(angle), 0)
    vertices.push(vertex.clone())
  }

  const shape = new THREE.Shape()
  shape.moveTo(vertices[0].x, vertices[0].y)

  for (let i = 1; i < 6; ++i) {
    shape.lineTo(vertices[i].x, vertices[i].y)
  }
  shape.selfClose = true

  return shape
}

let id = 0
const generateId = () => id++

const HexTile = props => {
  return (
    <mesh
      position={props.position}
      rotation-x={-90 * DEG_TO_RAD}
      geometry={props.geometry}
      scale={[props.scale, props.scale, 1]}
    >
      <meshPhongMaterial color={0xff00ff} attach="material" />
    </mesh>
  )
}

class Tile {
  constructor(options) {
    options = options || {}
    let settings = {
      cell: null,
      geometry: null,
    }
    settings = Object.assign(settings, options)

    if (!settings.cell || !settings.geometry) {
      throw new Error('Missing Tile arguments: `cell` or `geometry`')
    }

    this.cell = settings.cell
    if (this.cell.tile && this.cell.tile !== this) this.cell.tile.dispose() // remove whatever was there
    this.cell.tile = this

    this.uniqueID = generateId()

    this.geometry = settings.geometry

    this.worldPosition = new THREE.Vector3()
  }

  setWorldPosition(position) {
    this.worldPosition.copy(position)
  }

  dispose() {
    if (this.cell && this.cell.tile) this.cell.tile = null
    this.cell = null
    this.geometry = null
  }
}

/*
 * Simple structure for holding grid coordinates and extra data about them.
 * @author Corey Birnbaum https://github.com/vonWolfehaus/
*/
class Cell {
  constructor(q, r, s, h) {
    this.q = q || 0 // x grid coordinate (using different letters so that it won't be confused with pixel/world coordinates)
    this.r = r || 0 // y grid coordinate
    this.s = s || 0 // z grid coordinate
    this.h = h || 1 // 3D height of the cell, used by visual representation and pathfinder, cannot be less than 1
    this.tile = null // optional link to the visual representation's class instance
    this.userData = {} // populate with any extra data needed in your game
    this.walkable = true // if true, pathfinder will use as a through node

    // rest of these are used by the pathfinder and overwritten at runtime, so don't touch
    this._calcCost = 0
    this._priority = 0
    this._visited = false
    this._parent = null
    this.uniqueID = generateId()
  }

  set(q, r, s) {
    this.q = q
    this.r = r
    this.s = s
    return this
  }

  copy(cell) {
    this.q = cell.q
    this.r = cell.r
    this.s = cell.s
    this.h = cell.h
    this.tile = cell.tile || null
    this.userData = cell.userData || {}
    this.walkable = cell.walkable
    return this
  }

  add(cell) {
    this.q += cell.q
    this.r += cell.r
    this.s += cell.s
    return this
  }

  equals(cell) {
    return this.q === cell.q && this.r === cell.r && this.s === cell.s
  }
}

const randomAngle = () => THREE.Math.degToRad(Math.round(Math.random()) * (Math.random() < 0.5 ? -360 : 360))
const random = () => {
  return {
    rotationY: randomAngle(),
    translateY: Math.random() * 10,
  }
}

const FlippantHexagonGrid = props => {
  const size = props.size || 5
  const cellSize = props.cellSize || 1.0
  const _hashDelimiter = '.'
  const _cellShape = HexagonShape()
  const _scale = 0.95
  const position = props.position || [0, 0, 0]
  const rotation = props.rotation || [0, 0, 0]

  let _cellWidth = -Infinity,
    _cellLength = -Infinity,
    extrudeSettings = {},
    cells = {},
    numCells = 0,
    _vec3 = new THREE.Vector3()
  let _geoCache = {}

  const cellToHash = cell => {
    return cell.q + _hashDelimiter + cell.r + _hashDelimiter + cell.s
  }

  const addCell = cell => {
    const hash = cellToHash(cell)
    if (cells[hash]) {
      return
    }

    cells[hash] = cell
    numCells++

    return cell
  }

  const generate = () => {
    let x, y, z, c

    for (x = -size; x < size + 1; ++x) {
      for (y = -size; y < size + 1; ++y) {
        // axial coordinates
        z = -x - y
        if (Math.abs(x) <= size && Math.abs(y) <= size && Math.abs(z) <= size) {
          c = new Cell(x, y, z)
          addCell(c)
        }
      }
    }
  }

  const generateTile = (cell, scale, material) => {
    const height = Math.min(1, Math.abs(cell.h))
    let geo = _geoCache[height]

    if (!geo) {
      const settings = Object.assign({}, extrudeSettings, { depth: height })
      geo = new THREE.ExtrudeGeometry(_cellShape, settings)
      _geoCache[height] = geo
    }

    const tile = new Tile({
      size: cellSize,
      scale: scale,
      cell: cell,
      geometry: geo,
      material: material,
    })
    cell.tile = tile
    return tile
  }
  const cellToPixel = cell => {
    _vec3.x = cell.q * _cellWidth * 0.75
    _vec3.y = cell.h
    _vec3.z = -((cell.s - cell.r) * _cellLength * 0.5)
    return _vec3
  }

  const generateTiles = () => {
    const tiles = []

    const settings = {
      tileScale: 0.95,
      cellSize: cellSize,
      material: null,
      extrudeSettings: {
        depth: 1,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0.5,
        bevelThickness: 0.5,
      },
    }

    // overwrite with any new dimensions
    _cellWidth = cellSize * 2
    _cellLength = SQRT3 * 0.5 * _cellWidth

    extrudeSettings = settings.extrudeSettings

    var i, t, c
    for (i in cells) {
      c = cells[i]
      t = generateTile(c, settings.tileScale, settings.material)
      t.setWorldPosition(cellToPixel(c))
      tiles.push(t)
    }
    return tiles
  }

  generate({})
  const tiles = generateTiles({})

  const [springs, set] = useSprings(tiles.length, i => ({
    from: {
      ...random(),
      translateY: 0,
    },
    ...random(),
    translateY: -5,
    config: { mass: 20, tension: 500, friction: 170 },
  }))
  let a = 0
  useEffect(() => {
    return void setInterval(() => {
      ++a
      return set(i => ({ ...random(), translateY: a % 2 === 0 ? 0 : i * 0.5, delay: (i + 1) * 50 }))
    }, 3500)
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <ambientLight intensity={0.2} />
      <pointLight position={[1, 1, 2]} intensity={0.8} />
      <group scale={[0.1, 0.1, 0.1]} rotation-x={-90 * DEG_TO_RAD}>
        {tiles.map((tile, i) => {
          const spring = springs[i]
          const { rotationY, translateY } = spring
          const { worldPosition: position } = tile
          position.set(position.x, translateY.getValue(), position.z)
          return (
            <animated.mesh
              position={position}
              position-y={translateY}
              rotation-x={-90 * DEG_TO_RAD}
              rotation-y={rotationY}
              geometry={tile.geometry}
              scale={[_scale, _scale, 1]}
              key={i}
            >
              <meshPhongMaterial color={i * 0x010101} attach="material" />
            </animated.mesh>
          )
        })}
      </group>
    </group>
  )
}

export { FlippantHexagonGrid }
