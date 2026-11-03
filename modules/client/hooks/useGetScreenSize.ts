import * as React from "react";
import { useMediaQuery, useTheme } from "@mui/material";

export enum ScreenSize {
  "XS" = 1,
  "S" = 2,
  "M" = 3,
  "L" = 4,
  "XL" = 5,
}
export const useGetScreenSize = (): ScreenSize => {
  const theme = useTheme();
  const onlyExtraSmallScreen = useMediaQuery(theme.breakpoints.only("xs"));
  const onlySmallScreen = useMediaQuery(theme.breakpoints.only("sm"));
  const onlyMediumScreen = useMediaQuery(theme.breakpoints.only("md"));
  const onlyLargeScreen = useMediaQuery(theme.breakpoints.only("lg"));
  const onlyXLargeScreen = useMediaQuery(theme.breakpoints.only("xl"));

  const [screenSize, setScreenSize] = React.useState<ScreenSize>(ScreenSize.M);

  React.useEffect(() => {
    if (onlyExtraSmallScreen) {
      setScreenSize(ScreenSize.XS);
    } else if (onlySmallScreen) {
      setScreenSize(ScreenSize.S);
    } else if (onlyMediumScreen) {
      setScreenSize(ScreenSize.M);
    } else if (onlyLargeScreen) {
      setScreenSize(ScreenSize.L);
    } else if (onlyXLargeScreen) {
      setScreenSize(ScreenSize.XL);
    }
  }, [onlyLargeScreen, onlyMediumScreen, onlySmallScreen, onlyXLargeScreen, onlyExtraSmallScreen, screenSize]);

  return screenSize;
};
