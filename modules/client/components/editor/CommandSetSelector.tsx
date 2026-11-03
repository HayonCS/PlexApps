import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useGetAllCommandSets } from "modules/client/hooks/useGetAllCommandSets";
import * as React from "react";

export const CommandSetSelector: React.FC<{
  currentCommandSetName?: string;
  readOnly?: boolean;
}> = (props) => {
  const allCommandSets = useGetAllCommandSets();
  const [currentCommandSet, setCurrentCommandSet] = React.useState<string>(props.currentCommandSetName ?? "");

  React.useEffect(() => {
    if (props.currentCommandSetName) {
      setCurrentCommandSet(props.currentCommandSetName);
    }
  }, [props.currentCommandSetName]);

  return (
    <FormControl disabled={props.readOnly} fullWidth={true} style={{ width: "95%", alignSelf: "center" }}>
      <Select
        data-testid={"commandset-selector"}
        value={
          allCommandSets !== "LOADING" && allCommandSets !== "ERROR" && allCommandSets.includes(currentCommandSet)
            ? currentCommandSet
            : ""
        }
        onChange={(event: SelectChangeEvent) => {
          setCurrentCommandSet(event.target.value);
        }}
        renderValue={(selected) => {
          if (selected.length === 0) {
            return <em style={{ opacity: "30%" }}>Commandset Not Available</em>;
          }
          return selected;
        }}
        native={false}
        readOnly={props.readOnly}
        displayEmpty={true}
        disabled={props.readOnly}
        variant="outlined"
        MenuProps={{ variant: "menu", style: { width: "100px", height: "80%" } }}
        slotProps={{ input: { color: "white", disabled: props.readOnly } }}
      >
        <MenuItem disabled={true} value="">
          Placeholder
        </MenuItem>
        {allCommandSets !== "ERROR" &&
          allCommandSets !== "LOADING" &&
          allCommandSets.length > 0 &&
          allCommandSets.map((commandSetName: string, index: number) => {
            return (
              <MenuItem key={index} value={commandSetName}>
                {commandSetName}
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
};
