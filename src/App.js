import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import './App.css'
import { apply as applyThree, Canvas, useRender, useThree } from 'react-three-fiber'
import { apply as applySpring, useSpring, animated as anim } from 'react-spring/three'
import 'react-dat-gui/build/react-dat-gui.css'
import DatGui, { DatColor, DatNumber } from 'react-dat-gui'
import GuiOptions from './components/Gui'

import Monolith from './components/Monolith'
import clock from './util/Clock'

/*
 * then manipulate the scenes in here
 *
 * reference:
 * Users/johnmarinelli/Documents/react-three-fiber/examples/components/MultiScene.js
 */

const Main = () => {
  const [{ top, mouse }, set] = useSpring(() => ({ top: 0, mouse: [0, 0] }))
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => {
    return set({
      mouse: [x - window.innerWidth / 2, y - window.innerHeight / 2],
    })
  }, [])
  const onScroll = useCallback(e => set({ top: e.target.scrollTop }), [])
  clock.start()
  return (
    <>
      <DatGui data={GuiOptions.options} onUpdate={GuiOptions.setOptions}>
        <DatNumber path="voronoi3DScale" label="Voronoi3D Scale" min={0} max={50} step={0.05} />
        <DatColor path="feelsLike" label="Feels Like" />
      </DatGui>
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
