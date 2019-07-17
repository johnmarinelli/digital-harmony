import 'react-dat-gui/build/react-dat-gui.css'
import * as THREE from 'three/src/Three'
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
      feelsLike: '#2FA1D6',
      color2: '#50d62e',
      color3: '#f20048',
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
      lissajousTrailDiscrete: true,
      zPositionFunctionX: 'cos',
      zPositionFunctionY: 'sin',
      fourthSceneTimeScale: 0.01,
      cyclePercentage: 0.0,
      cyclePercentageOverride: true,
      mixPercentage: 0.5,
      subjectState: -1,
      octahedronOpacity: 1.0,
      octahedronColor: '#c9c9c9',
      octahedronScale: { x: 1, y: 1, z: 1, all: 1 },
      octahedronRotation: { x: 1, y: 1, z: 1 },
      subjectStateOverride: false,
    }

    this.setOptions = this.setOptions.bind(this)
  }

  setOptions(options) {
    this.options = Object.assign({}, this.options, options)
  }

  // make dat.gui react to react-spring value changes
  syncFifthSceneOptions(props) {
    this.options.octahedronOpacity = props['material-opacity'].getValue()
    //this.options.octahedronColor = Number(props['material-color'].getValue()).toString(16)

    const rotation = props.rotation.getValue()
    this.options.octahedronRotation.x = THREE.Math.radToDeg(rotation[0])
    this.options.octahedronRotation.y = THREE.Math.radToDeg(rotation[1])
    this.options.octahedronRotation.z = THREE.Math.radToDeg(rotation[2])

    const scale = props.scale.getValue()
    this.options.octahedronScale.x = scale[0]
    this.options.octahedronScale.y = scale[1]
    this.options.octahedronScale.z = scale[2]
  }
}

const GuiOptions = new GuiImpl()
export default GuiOptions
