import { createTheme } from "@mui/material/styles";
import { GentexBlue, AppFont } from "client/styles/app-theme";
import type {} from "@mui/material/themeCssVarsAugmentation";

const baseFontSize = 12;

//https://material-ui.com/customization/default-theme/
export const AppTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        text: {
          primary: "#FFFFFF",
          secondary: "rgba(255, 255, 255, 0.7)",
          disabled: "rgba(255, 255, 255, 0.5)",
        },
        background: {
          default: "#0f1214",
          paper: "#1e2327",
        },
        primary: {
          main: GentexBlue,
          light: "rgb(61, 115, 183)",
          dark: "rgb(9, 56, 116)",
          contrastText: "#fff",
        },
        secondary: {
          main: "#0087f5",
          light: "rgb(51, 159, 247)",
          dark: "rgb(0, 94, 171)",
          contrastText: "#fff",
        },
        success: {
          main: "#4caf50", //green
          contrastText: "black",
        },
        warning: {
          main: "#f57c00", //orange
          contrastText: "black",
        },
        error: {
          main: "#d32f2f", //red
          contrastText: "black",
        },
        divider: "rgba(255, 255, 255, 0.12)",
        parameterDirection: {
          input: "Orange",
          output: "#00FA9A",
          memory: "Violet",
          none: "Red",
        },
      },
    },
    light: {
      palette: {
        mode: "light",
        text: {
          primary: "rgba(0, 0, 0, 0.87)",
          secondary: "rgba(255, 255, 255, 1)",
          disabled: "rgba(0, 0, 0, 0.38)",
        },
        background: {
          default: "#fafafa",
          paper: "#f0f0f0ff",
        },
        primary: {
          main: GentexBlue,
          light: "rgb(61, 115, 183)",
          dark: "rgb(9, 56, 116)",
          contrastText: "#fff",
        },
        secondary: {
          main: "#0087f5",
          light: "rgb(51, 159, 247)",
          dark: "rgb(0, 94, 171)",
          contrastText: "#fff",
        },
        success: {
          main: "#4caf50", //green
          contrastText: "black",
        },
        warning: {
          main: "#f57c00", //orange
          contrastText: "black",
        },
        error: {
          main: "#d32f2f", //red
          contrastText: "black",
        },
        parameterDirection: {
          input: "Orange",
          output: "#14a36c",
          memory: "Violet",
          none: "Red",
        },
      },
    },
  },
  shape: {
    borderRadius: 7,
  },
  breakpoints: {
    values: {
      xs: 500,
      sm: 1200,
      md: 1500,
      lg: 2000,
      xl: 2500,
    },
  },
  typography: () => ({
    fontSize: baseFontSize,
    fontFamily: AppFont,
    fontWeightBold: 500,
    fontWeightLight: 1,
    h1: {
      fontSize: "2em",
    },
    h2: {
      fontSize: "1.5em",
    },
    h3: {
      fontSize: "1.17em",
    },
    h4: {
      fontSize: "1em",
    },
    h5: {
      fontSize: "0.83em",
    },
    h6: {
      fontSize: "0.75em",
    },
    body: {
      fontSize: "1rem",
    },
  }),
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "1em",
          fontFamily: "Roboto",
        },
      },
      defaultProps: {
        enterDelay: 1000,
      },
    },
  },
});
