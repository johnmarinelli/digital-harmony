import React, { useCallback } from 'react'
import './App.css'
import { Canvas } from 'react-three-fiber'
import { useSpring } from 'react-spring/three'
import 'react-dat-gui/build/react-dat-gui.css'
//import DatGui, { DatColor, DatNumber, DatBoolean } from 'react-dat-gui'
import * as dat from 'dat.gui'
import GuiOptions from './components/Gui'

import Monolith from './components/Monolith'
import { states as OctahedronStates } from './components/lib/Octahedron'
import clock from './util/Clock'

const DatGui = () => {
  const gui = new dat.GUI()
  const globalFolder = gui.addFolder('Global')
  globalFolder.addColor(GuiOptions.options, 'feelsLike')
  globalFolder.addColor(GuiOptions.options, 'color2').name('Color 2')
  globalFolder.addColor(GuiOptions.options, 'color3').name('Color 3')
  globalFolder.add(GuiOptions.options, 'colorOverride').name('Override colors ^')
  globalFolder.add(GuiOptions.options, 'currentScene', 0, 4, 1)
  globalFolder.open()
  const firstSceneFolder = gui.addFolder('First Scene')
  firstSceneFolder.open()
  const secondSceneFolder = gui.addFolder('Second Scene')
  secondSceneFolder.open()
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
  thirdSceneFolder.open()
  const fourthSceneFolder = gui.addFolder('Fourth Scene')
  fourthSceneFolder.add(GuiOptions.options, 'zPositionFunctionX', { cos: 'cos', sin: 'sin' })
  fourthSceneFolder.add(GuiOptions.options, 'zPositionFunctionY', { cos: 'cos', sin: 'sin' })
  fourthSceneFolder.add(GuiOptions.options, 'fourthSceneTimeScale', 0.0, 0.5, 0.001)
  fourthSceneFolder
    .add(GuiOptions.options, 'cyclePercentage', 0.0, 1.0, 0.001)
    .name('Cycle Percentage (radians)')
    .listen()
  fourthSceneFolder.add(GuiOptions.options, 'cyclePercentageOverride').name('Override ^')
  fourthSceneFolder.open()

  const fifthSceneFolder = gui.addFolder('Fifth Scene')
  fifthSceneFolder.add(GuiOptions.options, 'mixPercentage', 0.0, 1.0, 0.05)
  fifthSceneFolder.add(GuiOptions.options, 'subjectState', -1, OctahedronStates.length - 2, 1)
  fifthSceneFolder.add(GuiOptions.options, 'subjectStateOverride')
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
