import React from 'react'

/*
 * provides a public API that exposes a THREE Scene
 * via React reference.
 */
class BaseController extends React.PureComponent {
  constructor() {
    super(...arguments)
    this.sceneRef = React.createRef()
  }
}

export { BaseController }
