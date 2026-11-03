import * as React from "react";
import { OperationType } from "modules/core/types";
import { GridColTypeDef, GridRenderCellParams, GridRowId, useGridApiContext } from "@mui/x-data-grid-premium";
import { Selector, SelectorOption } from "../common/selector/Selector";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EditIcon from "@mui/icons-material/Edit";
import { GentexBlue } from "modules/client/styles/app-theme";
import VerifiedIcon from "@mui/icons-material/Verified";
import SsidChartIcon from "@mui/icons-material/SsidChart";

const GetAdornment = (value: OperationType) => {
  switch (value) {
    case OperationType.OP_CALIBRATE:
      return <SettingsSuggestIcon data-testid={"calibrate-adornment"} style={{ color: "orange" }} />;
    case OperationType.OP_VERIFY:
      return <TaskAltIcon data-testid={"verify-adornment"} style={{ color: "green" }} />;
    case OperationType.OP_NOT_SET:
      return <ErrorOutlineIcon data-testid={"not-set-adornment"} style={{ color: "red" }} />;
    case OperationType.OP_WRITE:
      return <EditIcon data-testid={"write-adornment"} style={{ color: `${GentexBlue}` }} />;
    case OperationType.OP_DEF_CHK:
      return <VerifiedIcon data-testid={"default-check-adornment"} style={{ color: "yellow" }} />;
    case OperationType.OP_LIMIT:
      return <SsidChartIcon data-testid={"limit-adornment"} style={{ color: "orangered" }} />;
    default:
      return "Invalid Value Selected";
  }
};

const OperationSelector: React.FC<{ id: GridRowId; field: string; isEditable?: boolean; value?: OperationType }> = (
  props
) => {
  const [selectedValue, setSelectedValue] = React.useState<OperationType>(props.value ?? OperationType.OP_NOT_SET);
  const apiRef = useGridApiContext();

  React.useEffect(() => {
    setSelectedValue(props.value ?? OperationType.OP_NOT_SET);
  }, [props.value]);

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "inherit",
      }}
    >
      <Selector
        value={selectedValue}
        readOnly={!props.isEditable}
        autoOpen={props.isEditable}
        disableDropdownArrow={true}
        onValueChanged={async (value: any) => {
          setSelectedValue(value);
          if (apiRef.current) {
            await apiRef.current.setEditCellValue({ id: props.id, field: props.field, value: value });
            await apiRef.current.stopCellEditMode({
              id: props.id,
              field: props.field,
            });
          }
        }}
      >
        {...Object.values(OperationType).map((value) => {
          return (
            <SelectorOption
              key={value}
              value={OperationType[value]}
              displayValue={value.replace("OP_", "").replace("_", " ")}
              data-testid={`${value.toLowerCase()}-option`}
              startAdornment={GetAdornment(value)}
            />
          );
        })}
      </Selector>
    </div>
  );
};

export const OperationSelectorColumnType: GridColTypeDef<OperationType> = {
  type: "custom",
  resizable: true,
  filterable: true,
  sortable: true,
  groupable: false,
  display: "flex",
  renderCell: (params: GridRenderCellParams) => {
    return <OperationSelector id={params.id} field={params.field} isEditable={false} value={params.value} />;
  },
  renderEditCell: (params: GridRenderCellParams) => {
    return <OperationSelector id={params.id} field={params.field} isEditable={true} value={params.value} />;
  },
};

export default OperationSelector;
