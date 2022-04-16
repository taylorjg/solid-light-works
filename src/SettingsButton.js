import { useState } from 'react'
import { Drawer } from '@mui/material'
import SettingsPanel from './SettingsPanel'
import { StyledSettingsIcon } from './SettingsButton.styles'
// import { useQueryParams } from './useQueryParams'
// import { Mode } from './three-app'

const SettingsButton = ({ threeAppActions }) => {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // const queryParams = useQueryParams()

  // const [settings, setSettings] = useState(() => ({
  //   mode: queryParams.getString('mode', Mode.Mode2D),
  //   behindOnly: queryParams.getBool('behindOnly', false),
  //   autoRotate: queryParams.getBool('autoRotate', false),
  //   autoRotateSpeed: queryParams.getNumber('autoRotateSpeed', 0.5),
  //   axesEnabled: queryParams.getBool('axesEnabled', false),
  //   intersectionPointsEnabled: queryParams.getBool('intersectionPointsEnabled', false),
  //   vertexNormalsEnabled: queryParams.getBool('vertexNormalsEnabled', false)
  // }))

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
        <SettingsPanel threeAppActions={threeAppActions} onClose={closeDrawer} />
      </Drawer>
    </>
  )
}

export default SettingsButton
