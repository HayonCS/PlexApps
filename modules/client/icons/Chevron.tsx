import * as React from "react";
import { SvgIcon, SxProps, Theme } from "@mui/material";

export const Chevron: React.FC<{
  sx?: SxProps<Theme>;
}> = (props) => (
  <SvgIcon {...props} width="8" height="13" viewBox="0 0 8 13">
    <path
      fill="none"
      fillRule="evenodd"
      stroke="#FFF"
      strokeLinecap="round"
      strokeWidth="2"
      d="M201.358 30L208.116 30.242 208.358 37"
      transform="rotate(45 135.95 -225.043)"
    />
  </SvgIcon>
);
