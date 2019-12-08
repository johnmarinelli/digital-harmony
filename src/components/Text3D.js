import React from 'react'
import * as THREE from 'three'

class Text3D extends React.PureComponent {
  constructor() {
    super()
    this.state = { font: null }
  }

  componentDidMount() {
    const { fontPath } = this.props
    const fontLoader = new THREE.FontLoader()
    fontLoader.load(fontPath, font => {
      this.setState(state => {
        return { font }
      })
    })
  }

  render() {
    const { font } = this.state
    const { textContent, position } = this.props

    return font != null ? (
      <mesh position={position || [0, 0, 0]}>
        <textGeometry
          attach="geometry"
          args={[
            textContent,
            {
              font: font,
              size: 0.5,
              height: 0.5,
              curveSegments: 1,
              bevelEnabled: false,
            },
          ]}
        />
        <meshPhongMaterial attach="material" color={0xff0000} specular={0xffffff} />
      </mesh>
    ) : null
  }
}

export { Text3D }
