import styled from '@emotion/styled'

const StyledPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 15rem;
  height: 95vh;
  display: flex;
  flex-direction: column;
`

const StyledArea = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: .5rem;
  color: rgba(0, 0, 0, 0);
  @media(hover: hover) {
    &:hover {
      color: white;
      opacity: .5;
      cursor: pointer;
    }
  }
`

const OverlayButtons = ({ onToggleMode, onSwitchInstallation, onSwitchCameraPose }) => {

  return (
    <StyledPanel>
      <StyledArea onClick={() => onToggleMode()}>
      </StyledArea>

      <StyledArea onClick={() => onSwitchInstallation()}>
      </StyledArea>

      <StyledArea onClick={() => onSwitchCameraPose()}>
      </StyledArea>
    </StyledPanel>
  )
}

export default OverlayButtons
