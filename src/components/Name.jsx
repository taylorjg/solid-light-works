import { Typography } from "@mui/material";

import { StyledName } from "./Name.styles";

export const Name = ({ currentInstallation }) => {
  const name = currentInstallation.config.name;

  return name ? (
    <StyledName>
      <Typography variant="h4">{name}</Typography>
    </StyledName>
  ) : null;
};
