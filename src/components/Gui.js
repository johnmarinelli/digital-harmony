import 'react-dat-gui/build/react-dat-gui.css'
//import { GuiContext, GuiContextConsumer } from '../contexts/GuiContext'

/*
class Gui extends Component {
  state = {
    data: {
      package: 'react-dat-gui',
      power: 9000,
      isAwesome: true,
      feelsLike: '#2FA1D6',
    },
  }

  handleUpdate = data => {
    this.setState({ data })
  }

  render() {
    const { data } = this.state
    const { children } = this.props

    return (
      <>
        <DatGui data={data} onUpdate={this.handleUpdate}>
          <DatString path="package" label="Package" />
          <DatNumber path="power" label="Power" min={9000} max={9999} step={1} />
          <DatBoolean path="isAwesome" label="Awesome?" />
          <DatColor path="feelsLike" label="Feels Like" />
        </DatGui>
        {children}
      </>
    )
  }
}
*/
//Gui.contextType = GuiContext

/*
const Gui = ({ children }) => {
  const [data, setData] = useState({
    package: 'react-dat-gui',
    power: 9000,
    isAwesome: true,
    feelsLike: '#2FA1D6',
  })

  const datGuiOnUpdate = data => setData(data)

  return (
    <>
      <DatGui data={data} onUpdate={datGuiOnUpdate}>
        <DatString path="package" label="Package" />
        <DatNumber path="power" label="Power" min={9000} max={9999} step={1} />
        <DatBoolean path="isAwesome" label="Awesome?" />
        <DatColor path="feelsLike" label="Feels Like" />
      </DatGui>
      {children}
    </>
  )
}
*/

//export default Gui

class GuiImpl {
  constructor() {
    if (this.instance) {
      return this.instance
    }
    this.instance = this

    this.options = {
      //voronoi3DScale: 10.0,
      feelsLike: '#2FA1D6',
      colorOverride: false,
      currentScene: 0,
      sphereScale: 0.5,
      nX: 3,
      nY: 4,
      nZ: 7,
      phaseShift1: 0.7,
      phaseShift2: 1.0,
      phaseShift3: 0.0,
      lissajousKnotVisible: false,
      lissajousTrailDiscrete: false,
      zPositionFunctionX: 'cos',
      zPositionFunctionY: 'sin',
      fourthSceneTimeScale: 0.01,
      cyclePercentage: 0.0,
    }

    this.setOptions = this.setOptions.bind(this)
  }

  setOptions(options) {
    this.options = Object.assign({}, this.options, options)
  }
}

const GuiOptions = new GuiImpl()
export default GuiOptions
