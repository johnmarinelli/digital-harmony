import React from 'react'
const initialState = {
  data: {
    package: 'react-dat-gui',
    power: 9000,
    isAwesome: true,
    feelsLike: '#2FA1D6',
  },
}
const GuiContext = React.createContext(initialState)
/*
const reducer = (state, action) => state

const GuiContextProvider = props => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const value = { state, dispatch }
  return <GuiContext.Provider value={value}>{props.children}</GuiContext.Provider>
}
*/
const GuiContextConsumer = GuiContext.Consumer
export { GuiContext, GuiContextConsumer }
