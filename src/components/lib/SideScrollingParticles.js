import React, { useMemo, useRef, useContext, useState, useEffect } from 'react'
import { useRender, useThree } from 'react-three-fiber'
import * as THREE from 'three'

const Particles = ({ top, scrollMax }) => {
  const group = useRef()

  const numParticles = 5
  const particleGeometries = ['ico', 'dod', 'cyl']

  const [particles, originalYPositions] = useMemo(() => {
    const particles = [],
      originalYPositions = []
    const getGeometry = (str, props, returnType = 'component') => {
      if (returnType === 'component') {
        if (str === 'ico') return <icosahedronBufferGeometry name="geometry" {...props} />
        if (str === 'dod') return <dodecahedronBufferGeometry name="geometry" {...props} />
        if (str === 'cyl') return <cylinderBufferGeometry name="geometry" {...props} />
      } else if (returnType === 'three') {
        if (str === 'ico') return new THREE.IcosahedronBufferGeometry(props.radius)
        if (str === 'dod') return new THREE.DodecahedronBufferGeometry(props.radius)
        if (str === 'cyl') return new THREE.CylinderBufferGeometry(props.radius)
      }
    }
    let particleGeometriesIndex = 0
    let particleGeometryFn = null
    let x = 0.0,
      y = 0.0,
      z = 1.0

    let radius = 0.3
    let geometry = null
    let material = null

    let xScale = 0.0,
      yScale = 0.0,
      zScale = 0.0

    let mesh = null

    for (let i = 0; i < numParticles; ++i) {
      particleGeometriesIndex = Math.floor(Math.random() * 100.0) % particleGeometries.length
      const geometryString = particleGeometries[particleGeometriesIndex]

      x = (Math.random() - 0.5) * 7.0
      y = (Math.random() - 0.5) * 7.0
      radius = 0.1

      xScale = 0.2 + (Math.random() - 0.5) * 0.01
      yScale = 0.2 + (Math.random() - 0.5) * 0.01
      zScale = 0.2 + (Math.random() - 0.5) * 0.01

      //particle = new particleGeometryFn()

      const props = {
        radius,
      }

      geometry = getGeometry(geometryString, props, 'component')
      material = new THREE.MeshLambertMaterial({ color: 'white' })

      particles.push(
        <mesh
          key={i}
          position={[x, y, z]}
          scale={[xScale, yScale, zScale]}
          material={new THREE.MeshLambertMaterial({ color: 'white' })}
          castShadow
        >
          {geometry}
        </mesh>
      )
      originalYPositions.push(y)
    }

    return [particles, originalYPositions]
  })

  useRender(() => {
    const { current: { children } } = group

    const numChildren = children.length
    for (let i = 0; i < numChildren; ++i) {
      const child = children[i]
      child.position.x -= 0.01
      if (child.position.x < -3.0) {
        child.position.x = 3.0
      }

      const y = top.interpolate([0, 500], [10.0, originalYPositions[i]])
      child.position.y = y.getValue()
    }
  })

  return <group ref={group}>{particles}</group>
}
