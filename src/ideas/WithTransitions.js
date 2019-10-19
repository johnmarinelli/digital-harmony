/*
 * an abstraction for handling TransitionManager
 */
const WithTransitions = Scenes => {
  const { gl: renderer, camera, size } = useThree()
  let transitionManager = null
  let transition = null

  useRender(() => {
    const elapsed = clock.getElapsedTime()
    transitionManager.update(elapsed)
    transition.render(renderer)
  }, true)

  return class extends React.PureComponent {
    constructor() {
      super()
      this.orbitControls = null
      this.ref = React.createRef()
      //this.refs = Scenes.map(() => React.createRef())
    }

    componentDidMount() {
      this.scenes = [this.ref.current.sceneRef.current]
      transition = new Transition(camera)
      transition.initializeScenes(...this.scenes.slice(0, 2))
      transitionManager = new TransitionManager(this.scenes, transition, true)

      this.orbitControls = new OrbitControls(camera, document.querySelector('.scroll-container'))
    }

    render() {
      const InsideMusicScene = WithScene(InsideMusic)
      console.log('Monolith::render')
      return (
        <>
          <InsideMusicScene ref={this.ref} />
        </>
      )

      //return Scenes.map((Scene, i) => <Scene ref={this.refs[i]} />)
    }
  }
}
