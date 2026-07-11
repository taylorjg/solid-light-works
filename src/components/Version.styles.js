import styled from "@emotion/styled";

export const StyledVersion = styled.div`
  position: fixed;
  bottom: 0.5rem;
  right: 0.5rem;
  font-style: italic;
  font-size: smaller;
  color: #ffffff;
  opacity: 0.5;
  &:hover {
    opacity: 1;
    transform: scale(1.2) translate(-0.2rem, -0.2rem);
  }
`;
