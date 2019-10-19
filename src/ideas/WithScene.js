/*
 * would be nice to have WithScene + WithTransitions,
 * but i still need to figure out how R3F interacts w/ React lifecycle
 */
const WithScene = Component => {
  return class extends React.Component {
    constructor() {
      super()
      console.log('WithScene::Ctor')
      this.sceneRef = React.createRef()
    }

    render() {
      console.log('WithScene::render', this.sceneRef)
      return (
        <scene ref={this.sceneRef}>
          <Component />
        </scene>
      )
    }
  }
}
