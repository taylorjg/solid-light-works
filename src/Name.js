import { StyledName } from "./Name.styles"

export const Name = ({ currentInstallation }) => {
  const name = currentInstallation.config.name

  return name ? <StyledName>{name}</StyledName> : null
}
