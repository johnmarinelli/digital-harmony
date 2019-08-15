import React, { useCallback } from 'react'
import './App.css'
import { extend, Canvas } from 'react-three-fiber'
import { useSpring } from 'react-spring/three'
import 'react-dat-gui/build/react-dat-gui.css'
//import DatGui, { DatColor, DatNumber, DatBoolean } from 'react-dat-gui'
import * as dat from 'dat.gui'
import GuiOptions from './components/Gui'

import Monolith from './components/Monolith'
import { Triggers } from './components/states/scenes/Fifth/index'
import clock from './util/Clock'
import * as meshline from 'three.meshline'

const initialize = () => {
  extend(meshline)
}

initialize()

const DatGui = () => {
  const gui = new dat.GUI()
  const globalFolder = gui.addFolder('Global')
  globalFolder.addColor(GuiOptions.options, 'feelsLike')
  globalFolder.addColor(GuiOptions.options, 'color2').name('Color 2')
  globalFolder.addColor(GuiOptions.options, 'color3').name('Color 3')
  globalFolder.add(GuiOptions.options, 'colorOverride').name('Override colors ^')
  globalFolder.add(GuiOptions.options, 'currentScene', 0, 7, 1).name('Current Scene')
  globalFolder.open()
  //const firstSceneFolder = gui.addFolder('First Scene')
  //const secondSceneFolder = gui.addFolder('Second Scene')
  const thirdSceneFolder = gui.addFolder('Third Scene')
  thirdSceneFolder.add(GuiOptions.options, 'nX', 0, 10, 1)
  thirdSceneFolder.add(GuiOptions.options, 'nY', 0, 10, 1)
  thirdSceneFolder.add(GuiOptions.options, 'nZ', 0, 10, 1)
  thirdSceneFolder.add(GuiOptions.options, 'phaseShift1', 0.0, 2.0, 0.1)
  thirdSceneFolder.add(GuiOptions.options, 'phaseShift2', 0.0, 2.0, 0.1)
  thirdSceneFolder.add(GuiOptions.options, 'phaseShift3', 0.0, 2.0, 0.1)
  thirdSceneFolder.add(GuiOptions.options, 'sphereScale', 0.1, 2.0, 0.1)
  thirdSceneFolder.add(GuiOptions.options, 'lissajousKnotVisible')
  thirdSceneFolder.add(GuiOptions.options, 'lissajousTrailDiscrete')
  const fourthSceneFolder = gui.addFolder('Fourth Scene')
  fourthSceneFolder.add(GuiOptions.options, 'zPositionFunctionX', { cos: 'cos', sin: 'sin' })
  fourthSceneFolder.add(GuiOptions.options, 'zPositionFunctionY', { cos: 'cos', sin: 'sin' })
  fourthSceneFolder.add(GuiOptions.options, 'fourthSceneTimeScale', 0.0, 0.5, 0.001)
  fourthSceneFolder
    .add(GuiOptions.options, 'cyclePercentage', 0.0, 1.0, 0.001)
    .name('Cycle Percentage (radians)')
    .listen()
  fourthSceneFolder.add(GuiOptions.options, 'cyclePercentageOverride').name('Override ^')

  const fifthSceneFolder = gui.addFolder('Fifth Scene')
  fifthSceneFolder.add(GuiOptions.options, 'mixPercentage', 0.0, 1.0, 0.05)
  fifthSceneFolder.add(GuiOptions.options, 'subjectState', -1, Triggers.length - 2, 1).listen()
  fifthSceneFolder
    .add(GuiOptions.options.octahedronScale, 'all', 0.1, 3.0, 0.1)
    .name('Scale')
    .onChange(value => {
      GuiOptions.options.octahedronScale.x = value
      GuiOptions.options.octahedronScale.y = value
      GuiOptions.options.octahedronScale.z = value
    })
  fifthSceneFolder
    .add(GuiOptions.options.octahedronScale, 'x', 0.1, 3.0, 0.1)
    .name('Scale X')
    .onChange(value => {
      GuiOptions.options.octahedronScale.x = value
    })
    .listen()
  fifthSceneFolder
    .add(GuiOptions.options.octahedronScale, 'y', 0.1, 3.0, 0.1)
    .name('Scale Y')
    .onChange(value => {
      GuiOptions.options.octahedronScale.y = value
    })
    .listen()
  fifthSceneFolder
    .add(GuiOptions.options.octahedronScale, 'z', 0.1, 3.0, 0.1)
    .name('Scale Z')
    .onChange(value => {
      GuiOptions.options.octahedronScale.z = value
    })
    .listen()
  fifthSceneFolder
    .add(GuiOptions.options.octahedronRotation, 'x', 0, 360, 1)
    .name('Rotation X')
    .onChange(value => {
      GuiOptions.options.octahedronRotation.x = value
    })
    .listen()
  fifthSceneFolder
    .add(GuiOptions.options.octahedronRotation, 'y', 0, 360, 1)
    .name('Rotation Y')
    .onChange(value => {
      GuiOptions.options.octahedronRotation.y = value
    })
    .listen()
  fifthSceneFolder
    .add(GuiOptions.options.octahedronRotation, 'z', 0, 360, 1)
    .name('Rotation Z')
    .onChange(value => {
      GuiOptions.options.octahedronRotation.z = value
    })
    .listen()
  fifthSceneFolder
    .add(GuiOptions.options, 'octahedronOpacity', 0.0, 1.0, 0.05)
    .name('Opacity')
    .listen()
  fifthSceneFolder
    .addColor(GuiOptions.options, 'octahedronColor')
    .name('Color')
    .listen()
  fifthSceneFolder.add(GuiOptions.options, 'subjectStateOverride').name('Override ^')
  fifthSceneFolder.open()

  return null
}

const Main = () => {
  const [{ top }, set] = useSpring(() => ({ top: 0 }))
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => {
    return set({
      mouse: [x - window.innerWidth / 2, y - window.innerHeight / 2],
    })
  }, [])
  const onScroll = useCallback(e => set({ top: e.target.scrollTop }), [])

  //const voronoi3DScale = <DatNumber path="voronoi3DScale" label="Voronoi3D Scale" min={0} max={50} step={0.05} />
  clock.start()
  return (
    <>
      <DatGui />
      <Canvas className="canvas">
        <Monolith top={top} />
      </Canvas>
      <div className="scroll-container" onScroll={onScroll} onMouseMove={onMouseMove}>
        <div style={{ height: '525vh' }} />
      </div>
    </>
  )
}

export default Main
