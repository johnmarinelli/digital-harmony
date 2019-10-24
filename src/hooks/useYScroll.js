import { useCallback, useEffect } from 'react'
import { useSpring, config } from '@react-spring/core'
import { useGesture } from 'react-use-gesture'
import clamp from 'lodash/clamp'

/*
 * copied from here: https://codesandbox.io/s/react-three-fiber-suspense-gltf-loader-l900i
 * "helpers > useYScroll.js"
 * todo: use this and understand it
 */
function useYScroll(bounds, props) {
  const [{ y }, set] = useSpring(() => ({ y: 0, config: config.slow }))
  const fn = useCallback(
    ({ xy: [, cy], previous: [, py], memo = y.getValue() }) => {
      const newY = clamp(memo + cy - py, ...bounds)
      set({ y: newY })
      return newY
    },
    [bounds, y, set]
  )
  const bind = useGesture({ onWheel: fn, onDrag: fn }, props)
  useEffect(() => props && props.domTarget && bind(), [props, bind])
  return [y, bind]
}

export { useYScroll }
