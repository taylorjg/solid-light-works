import packageJson from "../../package.json";
import { StyledVersion } from "./Version.styles";

export const Version = () => {
  return <StyledVersion>version: {packageJson.version}</StyledVersion>;
};
