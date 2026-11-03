import Palette from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    parameterDirection: {
      input: string;
      output: string;
      memory: string;
      none: string;
    };
  }

  interface PaletteOptions {
    parameterDirection: {
      input: string;
      output: string;
      memory: string;
      none: string;
    };
  }
}
