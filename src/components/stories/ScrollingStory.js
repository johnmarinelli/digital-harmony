import React from 'react'
import { animated } from 'react-spring/three'
import { BaseController } from '../controllers/Base'

class StorySegment extends React.Component {
  render() {
    return <animated.group position-y={this.props.factor}>{this.props.children}</animated.group>
  }
}

class ScrollingStory extends BaseController {
  render() {
    const { top, children: childrenOrChild, BackgroundComponent } = this.props

    const children = Array.isArray(childrenOrChild) ? childrenOrChild : [childrenOrChild]

    // magic number.
    // from top to bottom of my screen (MacBook Pro (15-inch, 2018)),
    // on chrome,
    // the y axis spans 6 units in both directions.
    const screenCoordinatesYInterval = 6.0
    const segments = children.map((child, i) => {
      const startPositionScreenCoordinates = i * screenCoordinatesYInterval * 2
      return React.cloneElement(
        child,
        Object.assign({}, child.props, {
          factor: top.interpolate(top => {
            const newY = startPositionScreenCoordinates - top / 50.0
            return newY * -1
          }),
          key: i,
        })
      )
    })

    return (
      <>
        {BackgroundComponent ? BackgroundComponent : null}
        {segments}
      </>
    )
  }
}
export { StorySegment, ScrollingStory }
