import { useState } from 'react'
import { Drawer } from '@mui/material'
import SettingsPanel from './SettingsPanel'
import { StyledSettingsIcon } from './SettingsButton.styles'

const SettingsButton = ({ threeAppActions }) => {

  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false)

  const openSettingsPanel = () => {
    setIsSettingsPanelOpen(true)
  }

  const closeSettingsPanel = () => {
    setIsSettingsPanelOpen(false)
  }

  return (
    <>
      <StyledSettingsIcon onClick={openSettingsPanel} />
      <Drawer anchor="left" open={isSettingsPanelOpen} onClose={closeSettingsPanel}>
        <SettingsPanel threeAppActions={threeAppActions} closeSettingsPanel={closeSettingsPanel} />
      </Drawer>
    </>
  )
}

export default SettingsButton
