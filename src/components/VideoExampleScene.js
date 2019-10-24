import React from 'react'
import * as THREE from 'three'
import { Video } from './Video'

const Lights = () => (
  <>
    <ambientLight color={0xffffff} intensity={0.8} />
    <spotLight color={0xffffff} intensity={0.7} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
  </>
)
class VideoExampleScene extends React.PureComponent {
  constructor() {
    super()
    this.sceneRef = React.createRef()
  }

  render() {
    return (
      <scene ref={this.sceneRef} background={new THREE.Color(0x000000)}>
        <Lights />
        <Video domElementId="kris_drinking" dimensions={[2, 2]} />
      </scene>
    )
  }
}

export { VideoExampleScene }
