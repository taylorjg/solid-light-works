import { StyledOverlayButtons, StyledOverlayButton } from './OverlayButtons.styles'

const OverlayButtons = ({ onToggleMode, onSwitchInstallation, onSwitchCameraPose }) => {

  return (
    <StyledOverlayButtons>
      <StyledOverlayButton onClick={() => onToggleMode()} />
      <StyledOverlayButton onClick={() => onSwitchInstallation()} />
      <StyledOverlayButton onClick={() => onSwitchCameraPose()} />
    </StyledOverlayButtons>
  )
}

export default OverlayButtons
