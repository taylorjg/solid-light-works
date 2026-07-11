import React from 'react'
import { createRoot } from 'react-dom/client'
import { injectGlobal } from '@emotion/css'
import { createTheme, ThemeProvider } from '@mui/material'
import App from './App'
import { threeAppInit } from '@app/three-app'

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  },
  transitions: {
    // So we have `transition: none;` everywhere
    create: () => 'none',
  }
})

injectGlobal`
  html, body, #visualisation-container {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    background-color: #000000;
  }
`

const main = async () => {
  const threeAppActions = await threeAppInit()

  const root = createRoot(document.getElementById('react-container'))
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={darkTheme}>
        <App threeAppActions={threeAppActions} />
      </ThemeProvider>
    </React.StrictMode>
  )

  threeAppActions.ready()
}

main()
