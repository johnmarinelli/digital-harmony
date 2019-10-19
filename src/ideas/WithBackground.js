import Background from '../src/Background'
/*
 * Abstraction for implementing a scrolling background
 */
const WithBackground = Component => {
  return class extends React.Component {
    render() {
      return (
        <>
          <Background
            color={top.interpolate(
              [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
              ['#FF0000', '#247BA0', '#70C1B3', '#f8f3f1']
            )}
          />
          <Component />
        </>
      )
    }
  }
}
