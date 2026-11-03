import { FormControl, FormControlLabel, Radio, RadioGroup, styled, Tooltip } from "@mui/material";
import { Actions } from "modules/client/redux/actions";
import { Selectors } from "modules/client/redux/selectors";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  alignSelf: "center",
  ".displayRadioButton": {
    color: theme.vars.palette.secondary.main,
  },
  ".MuiFormControlLabel-label": {
    fontSize: theme.typography.body2.fontSize,
    color: theme.vars.palette.primary.contrastText,
  },
}));

export const DisplayFormatSelector: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const displayFormat = useSelector(Selectors.Editor.displayFormat);
  const defaultDisplayFormat = useSelector(Selectors.UserSettings.defaultDisplayFormat);

  React.useEffect(() => {
    dispatch(Actions.EditorActions.setDisplayFormat(defaultDisplayFormat));
  }, [dispatch, defaultDisplayFormat]);

  return (
    <StyledFormControl className={"formControl"} data-testid={"display-format-selector"}>
      <RadioGroup
        sx={{ flexWrap: "nowrap", overflow: "hidden" }}
        row={true}
        value={displayFormat}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const selectedFormat = (event.target as HTMLInputElement).value;
          dispatch(Actions.EditorActions.setDisplayFormat(selectedFormat));
        }}
      >
        <Tooltip placement="top" title="Decimal Format">
          <FormControlLabel
            value="DECIMAL"
            control={<Radio className={"displayRadioButton"} color="secondary" data-testid={"decimal-format-radio"} />}
            label="DECIMAL"
            data-testid={"decimal-format-selector"}
          />
        </Tooltip>
        <Tooltip placement="top" title="Binary Format">
          <FormControlLabel
            value="BINARY"
            control={<Radio className={"displayRadioButton"} color="secondary" data-testid={"binary-format-radio"} />}
            label="BINARY"
            data-testid={"binary-format-selector"}
          />
        </Tooltip>
        <Tooltip placement="top" title="Hexadecimal Format">
          <FormControlLabel
            value="HEXADECIMAL"
            control={
              <Radio className={"displayRadioButton"} color="secondary" data-testid={"hexadecimal-format-radio"} />
            }
            label="HEX"
            data-testid={"hexadecimal-format-selector"}
          />
        </Tooltip>
        <Tooltip placement="top" title="Ascii Format">
          <FormControlLabel
            value="ASCII"
            control={<Radio className={"displayRadioButton"} color="secondary" data-testid={"ascii-format-radio"} />}
            label="ASCII"
            data-testid={"ascii-format-selector"}
          />
        </Tooltip>
      </RadioGroup>
    </StyledFormControl>
  );
};
