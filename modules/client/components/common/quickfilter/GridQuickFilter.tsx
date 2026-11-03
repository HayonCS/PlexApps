import * as React from "react";
import { styled } from "@mui/material/styles";
import { InputAdornment, TextField, Tooltip } from "@mui/material";
import {
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  QuickFilterTrigger,
  ToolbarButton,
  useGridApiContext,
} from "@mui/x-data-grid-premium";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import { useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

type OwnerState = {
  expanded: boolean;
};

const StyledQuickFilter = styled(QuickFilter)(({}) => ({
  display: "grid",
  alignItems: "center",
  marginLeft: "auto",
}));

const StyledToolbarButton = styled(ToolbarButton as React.ComponentType<any>, {
  shouldForwardProp: (prop) => prop !== "ownerState",
})<{
  ownerState: OwnerState;
}>(({ theme, ownerState }) => ({
  gridArea: "1 / 1",
  width: "min-content",
  height: "min-content",
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? "none" : "auto",
  transition: theme.transitions.create(["opacity"]),
  color: theme.palette.primary.contrastText,
}));

const StyledTextField = styled(TextField)<{
  ownerState: OwnerState;
}>(({ theme, ownerState }) => ({
  gridArea: "1 / 1",
  overflowX: "clip",
  width: ownerState.expanded ? 260 : "var(--trigger-width)",
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(["width", "opacity"]),
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
  },
  ".textFieldInput": {
    color: theme.palette.primary.contrastText,
    border: "none",
  },

  ".startAdornment": {
    color: theme.palette.primary.contrastText,
  },
  ".endAdornment": {
    color: theme.palette.primary.contrastText,
  },
}));

export const GridQuickFilter: React.FC<{}> = () => {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const apiRef = useGridApiContext();
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (searchParams) {
      if (apiRef.current) {
        apiRef.current.setQuickFilterValues([searchParams.get("search")]);
      }
    }
  }, [apiRef, searchParams]);

  React.useEffect(() => {
    if (triggerRef.current) {
      triggerRef.current.click();
    }
  }, []);

  const updateSearchParams = useDebouncedCallback((value) => {
    setSearchParams({ search: value });
  }, 200);

  return (
    <StyledQuickFilter
      data-testid={"grid-quick-filter"}
      onChange={(event) => {
        const target = event.target as HTMLInputElement;
        updateSearchParams(target.value);
      }}
    >
      <QuickFilterTrigger
        ref={triggerRef}
        data-testid={"grid-quick-filter-trigger"}
        render={({ ...triggerProps }, state) => (
          <Tooltip title="Search" enterDelay={1000} placement="top">
            <StyledToolbarButton
              style={{
                height: "35px",
                width: "35px",
              }}
              {...triggerProps}
              ownerState={{ expanded: state.expanded }}
              color="default"
              aria-disabled={state.expanded}
            >
              <SearchIcon fontSize="small" />
            </StyledToolbarButton>
          </Tooltip>
        )}
      />
      <QuickFilterControl
        data-testid={"grid-quick-filter-control"}
        render={({ ref, ...controlProps }, state) => (
          <StyledTextField
            {...controlProps}
            ownerState={{ expanded: state.expanded }}
            inputRef={ref}
            aria-label="Search"
            placeholder="Search..."
            size="small"
            slotProps={{
              input: {
                className: "textFieldInput",
                startAdornment: (
                  <InputAdornment position="start" className={"startAdornment"}>
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: state.value ? (
                  <InputAdornment position="end" className={"endAdornment"}>
                    <QuickFilterClear
                      className="quickFilterClear"
                      edge="end"
                      size="small"
                      aria-label="Clear search"
                      material={{ sx: { marginRight: -0.75 } }}
                      style={{ color: "inherit" }}
                      onClick={() => {
                        updateSearchParams.cancel();
                        apiRef.current?.setQuickFilterValues([]);
                        setSearchParams({});
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </QuickFilterClear>
                  </InputAdornment>
                ) : null,
                ...controlProps.slotProps?.input,
              },
              ...controlProps.slotProps,
            }}
          />
        )}
      />
    </StyledQuickFilter>
  );
};
