import React from 'react'
import clusters from 'clusters'
import * as THREE from 'three'

const initializeClusterData = () => {
  const numPoints = 100
  let points = []

  for (let i = 0; i < numPoints; ++i) {
    const x = THREE.Math.randFloat(-3.0, 3.0)
    const y = THREE.Math.randFloat(-3.0, 3.0)
    const z = THREE.Math.randFloat(-3.0, 3.0)

    const point = [x, y, z]
    points.push(point)
  }

  const numClusters = 3
  const numIterations = 100
  clusters.k(numClusters)
  clusters.iterations(numIterations)
  clusters.data(points)

  return clusters.clusters()
}

const Clusters = props => {
  const data = initializeClusterData()

  return data.map((cluster, index) => {
    const { centroid, points } = cluster
    return (
      <group key={index}>
        <mesh position={centroid} scale={[0.1, 0.1, 0.1]}>
          <boxGeometry attach="geometry" />
          <meshBasicMaterial color={0xff0000} attach="material" />
        </mesh>
      </group>
    )
  })
}

export { Clusters }
