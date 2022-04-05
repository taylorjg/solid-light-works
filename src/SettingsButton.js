import { useEffect, useRef, useState } from 'react'
import { Drawer } from '@mui/material'
import SettingsPanel from './SettingsPanel'
import OverlayButtons from './OverlayButtons'
import { StyledSettingsIcon } from './SettingsButton.styles'
import { useQueryParams } from './useQueryParams'
import { Mode } from './three-app'

const SettingsButton = ({ threeAppActions }) => {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const queryParams = useQueryParams()

  const [settings, setSettings] = useState(() => ({
    mode: queryParams.getString('mode', Mode.Mode2D),
    behindOnly: queryParams.getBool('behindOnly', false),
    // animationSpeed: queryParams.getNumber('animationSpeed', 750),
    autoRotate: queryParams.getBool('autoRotate', false),
    autoRotateSpeed: queryParams.getNumber('autoRotateSpeed', 0.5),
    axesEnabled: queryParams.getBool('axesEnabled', false),
    intersectionPointsEnabled: queryParams.getBool('intersectionPointsEnabled', false),
    vertexNormalsEnabled: queryParams.getBool('vertexNormalsEnabled', false)
  }))

  const ignoreNextSettingsEffectRef = useRef(false)

  const [previousSettings, setPreviousSettings] = useState(() => {
    const keys = Object.keys(settings)
    return Object.fromEntries(keys.map(key => [key, undefined]))
  })

  useEffect(() => {
    if (ignoreNextSettingsEffectRef.current) {
      ignoreNextSettingsEffectRef.current = false
      setPreviousSettings(settings)
      return
    }
    if (settings.mode !== previousSettings.mode) {
      threeAppActions.setMode(settings.mode)
    }
    if (settings.behindOnly !== previousSettings.behindOnly) {
      threeAppActions.setBehindOnly(settings.behindOnly)
    }
    // if (settings.animationSpeed !== previousSettings.animationSpeed) {
    //   threeAppActions.setAnimationSpeed(settings.animationSpeed)
    // }
    if (settings.autoRotate !== previousSettings.autoRotate) {
      threeAppActions.setAutoRotate(settings.autoRotate)
    }
    if (settings.autoRotateSpeed !== previousSettings.autoRotateSpeed) {
      threeAppActions.setAutoRotateSpeed(settings.autoRotateSpeed)
    }
    if (settings.axesEnabled !== previousSettings.axesEnabled) {
      threeAppActions.setAxesEnabled(settings.axesEnabled)
    }
    if (settings.intersectionPointsEnabled !== previousSettings.intersectionPointsEnabled) {
      threeAppActions.setIntersectionPointsEnabled(settings.intersectionPointsEnabled)
    }
    if (settings.vertexNormalsEnabled !== previousSettings.vertexNormalsEnabled) {
      threeAppActions.setVertexNormalsEnabled(settings.vertexNormalsEnabled)
    }
    setPreviousSettings(settings)
  }, [settings, previousSettings, threeAppActions])

  useEffect(() => {
    const onSettingsChanged = newSettings => {
      ignoreNextSettingsEffectRef.current = true
      setSettings(newSettings)
    }
    threeAppActions.addSettingsChangedListener(onSettingsChanged)
    return () => {
      threeAppActions.removeSettingsChangedListener(onSettingsChanged)
    }
  }, [threeAppActions])

  const openDrawer = () => {
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  return (
    <>
      <StyledSettingsIcon onClick={openDrawer} />
      <Drawer anchor="left" open={isDrawerOpen} onClose={closeDrawer}>
        <SettingsPanel settings={settings} setSettings={setSettings} onClose={closeDrawer} />
      </Drawer>
      <OverlayButtons
        onToggleMode={threeAppActions.toggleMode}
        onSwitchInstallation={threeAppActions.switchInstallation}
        onSwitchCameraPose={threeAppActions.switchCameraPose}
      />
    </>
  )
}

export default SettingsButton
