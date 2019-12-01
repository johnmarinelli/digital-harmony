import React, { useMemo } from 'react'
import { animated as anim } from 'react-spring/three'
import { useThree } from 'react-three-fiber'

// NOTE: `children` should be the text content to render
// from https://codesandbox.io/embed/y3j31r13zz
const Text = ({ children, position, opacity, color = 'white', fontSize = 410 }) => {
  const { viewport } = useThree()
  const { width: viewportWidth, height: viewportHeight } = viewport
  const scale = viewportWidth > viewportHeight ? viewportWidth : viewportHeight
  const canvas = useMemo(
    () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 2048
      const context = canvas.getContext('2d')
      context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = color
      context.fillText(children, 1024, 1024 - fontSize / 2.0)
      return canvas
    },
    [children]
  )

  return (
    <anim.sprite scale={[scale, scale, 1]} position={position}>
      <anim.spriteMaterial attach="material" transparent opacity={opacity}>
        <canvasTexture attach="map" image={canvas} premultiplyAlpha onUpdate={s => (s.needsUpdate = true)} />
      </anim.spriteMaterial>
    </anim.sprite>
  )
}

export default Text
