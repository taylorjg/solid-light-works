import styled from '@emotion/styled'

export const StyledOverlayButtons = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 15rem;
  height: 95vh;
  display: flex;
  flex-direction: column;
`

export const StyledOverlayButton = styled.div`
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
