import React from 'react'
import ReactDOM from 'react-dom'
import { injectGlobal } from '@emotion/css'
import { createTheme, ThemeProvider } from '@mui/material'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import threeApp from './three-app'

const darkTheme = createTheme({
  palette: {
    mode: "dark"
  }
})

injectGlobal`
  html, body, #container {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    background-color: #000000;
  }
`
const threeAppActions = threeApp()

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <App threeAppActions={threeAppActions} />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('container')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register()

threeAppActions.init()
