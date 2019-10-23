import React from 'react'
import { extend } from 'react-three-fiber'
import { animated, apply as applySpring } from 'react-spring/three'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'

extend({ AfterimagePass })
applySpring({ AfterimagePass })

const DrunkPass = ({ factor, shouldRenderToScreen }) => {
  let props = { args: [0.0], attachArray: 'passes', 'uniforms-damp-value': factor }

  if (shouldRenderToScreen) {
    props.renderToScreen = true
  }

  return <animated.afterimagePass {...props} />
}

export { DrunkPass }
