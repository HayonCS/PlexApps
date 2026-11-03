import { KeyboardArrowDown, KeyboardArrowLeft } from "@mui/icons-material";
import { ClickAwayListener, styled } from "@mui/material";
import { uniqueId } from "lodash-es";
import * as React from "react";

const StyledSelector = styled("div")(({ theme }) => [
  {
    backgroundColor: "inherit",
    "--anchor-name": "--menuAnchor",
    display: "flex",
    padding: "10px",
    alignItems: "center",
    anchorName: "var(--anchor-name)",
    ".openIcon": {
      position: "relative",
      marginLeft: "auto",
      color: theme.palette.text,
    },
    ".selectorMenu": {
      position: "fixed",
      positionAnchor: "var(--anchor-name)",
      positionArea: "bottom center",
      positionTryFallbacks: "top",
      width: "anchor-size(width)",
      backgroundColor: theme.vars.palette.background.default,
      display: "flex",
      flexDirection: "column",
      padding: "10px",
      zIndex: 1,
      border: `3px solid ${theme.palette.primary.main}`,
      borderRadius: theme.vars.shape.borderRadius,
    },
  },
  theme.applyStyles("light", {
    ".selectorMenu": {
      position: "fixed",
      positionAnchor: "var(--anchor-name)",
      positionArea: "bottom center",
      positionTryFallbacks: "top",
      width: "anchor-size(width)",
      backgroundColor: theme.vars.palette.grey[300],
      display: "flex",
      flexDirection: "column",
      padding: "10px",
      zIndex: 1,
      border: `3px solid ${theme.palette.primary.main}`,
      borderRadius: theme.vars.shape.borderRadius,
    },
  }),
]);

const StyledSelectorOption = styled("div")<{
  selected?: boolean;
}>(({ theme, selected }) => [
  {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: "3px",
    borderRadius: theme.shape.borderRadius,
    gap: "10px",
    "&:hover": {
      backgroundColor: selected ? "" : theme.vars.palette.background.paper,
      cursor: "pointer",
    },
  },
  theme.applyStyles("light", {
    "&:hover": {
      backgroundColor: selected ? "" : theme.vars.palette.grey[400],
      cursor: "pointer",
    },
  }),
]);

const SelectorContext = React.createContext({
  onClick: (value: any, displayValue: string, startAdornment?: React.ReactNode) => {
    value;
    displayValue;
    startAdornment;
  },
  isDisplayedOption: false,
});

export const SelectorOption: React.FC<{
  value: any;
  displayValue: string;
  startAdornment?: React.ReactNode;
  "data-testid"?: string;
  selected?: boolean;
}> = (props) => {
  const context = React.useContext(SelectorContext);
  return (
    <StyledSelectorOption
      data-testid={props["data-testid"] ?? ""}
      style={{
        justifyContent: `${context.isDisplayedOption ? "center" : "left"}`,
        overflow: `${context.isDisplayedOption ? "visible" : "hidden"}`,
      }}
      onClick={() => {
        context.onClick(props.value, props.displayValue, props.startAdornment);
      }}
      selected={props.selected}
    >
      {props.startAdornment}
      {props.displayValue}
    </StyledSelectorOption>
  );
};

const findChildWithPropertyValue = (children: React.ReactNode, propertyName: string, propertyValue: any) => {
  const childrenArray = React.Children.toArray(children);

  for (const child of childrenArray) {
    if (React.isValidElement(child) && child.props[propertyName] === propertyValue) {
      return child;
    }
  }
  return null;
};

export const Selector: React.FC<{
  children?: React.ReactNode;
  value?: any;
  onValueChanged?: (value: any) => Promise<void>;
  disableDropdownArrow?: boolean;
  readOnly?: boolean;
  autoOpen?: boolean;
}> = (props) => {
  const [selectedOption, setSelectedOption] = React.useState<{
    value: any;
    displayValue: string;
    startAdornment?: React.ReactNode;
  }>();
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [anchorId, setAnchorId] = React.useState<string>("");

  React.useEffect(() => {
    const id = uniqueId("--menuAnchor");
    setAnchorId(id);

    const child: ReturnType<typeof findChildWithPropertyValue> = findChildWithPropertyValue(
      props.children,
      "value",
      props.value
    );

    if (child) {
      setSelectedOption({
        value: child.props["value"],
        displayValue: child.props["displayValue"],
        startAdornment: child.props["startAdornment"],
      });
    }
  }, [props.children, props.value]);

  React.useEffect(() => {
    if (props.autoOpen && !props.readOnly) {
      setMenuOpen(true);
    }
  }, [props.autoOpen, props.readOnly]);

  const anchorStyle = { "--anchor-name": `${anchorId}` } as React.CSSProperties;

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (menuOpen) {
          setMenuOpen(false);
        }
      }}
    >
      <StyledSelector data-testid={"selector"} style={anchorStyle}>
        <SelectorContext.Provider
          value={{
            onClick: (value: any, displayValue: string, startAdornment?: React.ReactNode) => {
              if (!props.readOnly === true) {
                if (menuOpen && selectedOption?.value !== value) {
                  setSelectedOption({ value, displayValue, startAdornment });
                  props.onValueChanged && void props.onValueChanged(value);
                  setMenuOpen(false);
                } else {
                  setMenuOpen(true);
                }
              }
            },
            isDisplayedOption: true,
          }}
        >
          {selectedOption && (
            <SelectorOption
              selected={true}
              data-testid={"selected-option"}
              value={selectedOption.value}
              displayValue={selectedOption.displayValue}
              startAdornment={selectedOption.startAdornment}
            />
          )}
        </SelectorContext.Provider>
        {props.readOnly === false &&
          props.disableDropdownArrow === false &&
          (menuOpen ? (
            <KeyboardArrowDown
              className={"openIcon"}
              data-testid={"menu-opened-arrow"}
              onClick={() => {
                setMenuOpen(false);
              }}
            />
          ) : (
            <KeyboardArrowLeft
              className={"openIcon"}
              data-testid={"menu-closed-arrow"}
              onClick={() => {
                if (!props.readOnly === true) {
                  setMenuOpen(true);
                }
              }}
            />
          ))}
        {menuOpen && props.children !== undefined && (
          <SelectorContext.Provider
            value={{
              onClick: (value: any, displayValue: string, startAdornment?: React.ReactNode) => {
                if (selectedOption?.value !== value) {
                  setSelectedOption({ value, displayValue, startAdornment });
                  props.onValueChanged && void props.onValueChanged(value);
                }
                setMenuOpen(false);
              },
              isDisplayedOption: false,
            }}
          >
            <div data-testid={"selector-menu"} className={"selectorMenu"}>
              {props.children}
            </div>
          </SelectorContext.Provider>
        )}
      </StyledSelector>
    </ClickAwayListener>
  );
};
