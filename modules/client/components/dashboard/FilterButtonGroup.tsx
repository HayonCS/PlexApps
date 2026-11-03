import * as React from "react";
import { ToggleButtonGroup, ToggleButton, Tooltip, styled, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "modules/client/redux/actions";
import { Selectors } from "modules/client/redux/selectors";
import WorkingCopyIcon from "@mui/icons-material/EditNote";
import ProdReleaseIcon from "@mui/icons-material/Star";
import { FilterPanelTrigger, useGridApiContext } from "@mui/x-data-grid-premium";
import * as _ from "lodash-es";

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({}) => ({
  height: "35px",
  ".toggleButton": {
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },
}));

export const FilterButtonGroup: React.FC<{ className?: string }> = (props) => {
  const dispatch = useDispatch();
  const currentLibraryFilters = useSelector(Selectors.Dashboard.currentLibraryFilters);

  const apiContext = useGridApiContext();

  const onValueChanged = (event: React.MouseEvent<HTMLElement>, value: string[]) => {
    const addedItems = _.difference(value, currentLibraryFilters);

    if (addedItems.length > 0) {
      if (addedItems.includes("PRODUCTION RELEASE")) {
        const newFilters = value.filter((i) => i !== "WORKING COPY");
        dispatch(Actions.DashboardActions.setCurrentLibraryFilters(newFilters));
      } else if (addedItems.includes("WORKING COPY")) {
        const newFilters = value.filter((i) => i !== "PRODUCTION RELEASE");
        dispatch(Actions.DashboardActions.setCurrentLibraryFilters(newFilters));
      }
    } else {
      dispatch(Actions.DashboardActions.setCurrentLibraryFilters(value));
    }
  };

  return (
    <StyledToggleButtonGroup
      className={props.className ?? ""}
      data-testid="filter-button-group"
      value={currentLibraryFilters}
      onChange={onValueChanged}
      exclusive={false}
    >
      <Tooltip title="Create a Custom Filter">
        <FilterPanelTrigger
          render={
            <ToggleButton
              value={"CUSTOM"}
              className={"toggleButton"}
              onClickCapture={(event) => {
                if (currentLibraryFilters.includes("CUSTOM")) {
                  event.preventDefault();
                  event.stopPropagation();

                  if (apiContext.current) {
                    apiContext.current.showFilterPanel();
                  }
                } else {
                  onValueChanged(event, ["CUSTOM"]);
                }
              }}
            />
          }
        >
          <Typography>Custom Filter</Typography>
        </FilterPanelTrigger>
      </Tooltip>
      <Tooltip title="Filter Working Copies" enterDelay={500}>
        <ToggleButton data-testid="working-copy-filter-button" className={"toggleButton"} value="WORKING COPY">
          <WorkingCopyIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Filter Prod Releases" enterDelay={500}>
        <ToggleButton data-testid="prod-release-filter-button" className={"toggleButton"} value="PRODUCTION RELEASE">
          <ProdReleaseIcon />
        </ToggleButton>
      </Tooltip>
    </StyledToggleButtonGroup>
  );
};
