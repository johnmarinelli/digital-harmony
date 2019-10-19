import React from 'react'

class StorySegment extends React.PureComponent {
  render() {
    return this.props.children
  }
}

/*
 * input: a mapping from yOffset position to <group> of objects to render.
 * {
 *  0: <group>...</group>,
 *  500: <group>...</group>,
 *  1000: <group>...</group>
 *  etc
 * }
 */
class ScrollingStory extends React.PureComponent {
  constructor(props) {
    super(props)
    this.sceneRef = React.createRef()
    console.log(this.props)
  }

  render() {
    return <scene ref={this.sceneRef}>{this.props.children}</scene>
  }
}
export { StorySegment, ScrollingStory }
