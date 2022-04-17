import { StyledOverlayButtons, StyledOverlayButton } from './OverlayButtons.styles'

const OverlayButtons = ({ threeAppActions }) => {
  return (
    <StyledOverlayButtons>
      <StyledOverlayButton onClick={() => threeAppActions.toggleMode()} />
      <StyledOverlayButton onClick={() => threeAppActions.switchInstallation()} />
      <StyledOverlayButton onClick={() => threeAppActions.switchCameraPose()} />
    </StyledOverlayButtons>
  )
}

export default OverlayButtons
