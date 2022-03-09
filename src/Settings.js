import { useEffect, useState } from 'react'
import { Drawer } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import styled from '@emotion/styled'
import SettingsContent from './SettingsContent'
import OverlayButtons from './OverlayButtons'
import { useQueryParams } from './useQueryParams'
import { Mode } from './three-app'

const StyledSettingsIcon = styled(SettingsIcon)`
  color: #ffffff;
  opacity: .5;
  position: fixed;
  top: .5rem;
  left: .5rem;
  cursor: pointer;
  &:hover {
    opacity: 1;
    transform: scale(1.2);
  }
`

const Settings = ({ threeAppActions }) => {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const queryParams = useQueryParams()

  const [settings, setSettings] = useState(() => ({
    mode: queryParams.getString('mode', Mode.Mode2D),
    behindOnly: queryParams.getBool('behindOnly', false),
    animationSpeed: queryParams.getNumber('animationSpeed', 750),
    autoRotate: queryParams.getBool('autoRotate', false),
    autoRotateSpeed: queryParams.getNumber('autoRotateSpeed', 0.5),
    axesEnabled: queryParams.getBool('axesEnabled', false)
  }))

  const [previousSettings, setPreviousSettings] = useState(() => {
    const keys = Object.keys(settings)
    return Object.fromEntries(keys.map(key => [key, undefined]))
  })

  useEffect(() => {
    if (settings.mode !== previousSettings.mode) {
      threeAppActions.setMode(settings.mode)
    }
    if (settings.behindOnly !== previousSettings.behindOnly) {
      threeAppActions.setBehindOnly(settings.behindOnly)
    }
    if (settings.animationSpeed !== previousSettings.animationSpeed) {
      threeAppActions.setAnimationSpeed(settings.animationSpeed)
    }
    if (settings.autoRotate !== previousSettings.autoRotate) {
      threeAppActions.setAutoRotate(settings.autoRotate)
    }
    if (settings.autoRotateSpeed !== previousSettings.autoRotateSpeed) {
      threeAppActions.setAutoRotateSpeed(settings.autoRotateSpeed)
    }
    if (settings.axesEnabled !== previousSettings.axesEnabled) {
      threeAppActions.setAxesEnabled(settings.axesEnabled)
    }
    setPreviousSettings(settings)
  }, [settings, previousSettings]) // eslint-disable-line react-hooks/exhaustive-deps

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
        <SettingsContent settings={settings} setSettings={setSettings} onClose={closeDrawer} />
      </Drawer>
      <OverlayButtons
        onToggleMode={threeAppActions.toggleMode}
        onSwitchInstallation={threeAppActions.switchInstallation}
        onSwitchCameraPose={threeAppActions.switchCameraPose}
      />
    </>
  )
}

export default Settings
