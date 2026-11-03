import { createSelector, createSlice } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";
import { ActionType } from "../types";
import { State } from "../store";
import { MemoryMapCommandParameter, MemoryMapDocument } from "modules/core/schemas/memory-map.gen";
import { CommandSetDataDataType, DisplayFormatType } from "modules/core/types";
import { CommandSetDocument } from "modules/core/schemas/commandset.gen";
import { getDefaultParameterLimits } from "modules/core/parameter-defaults";

export type EditorState = {
  memoryMap: MemoryMapDocument | null;
  pristineMemoryMap: MemoryMapDocument | null;
  commandSet: CommandSetDocument | null;
  displayFormat: DisplayFormatType;
  readOnly: boolean;
};

const initialEditorState: EditorState = {
  memoryMap: null,
  pristineMemoryMap: null,
  commandSet: null,
  displayFormat: "DECIMAL",
  readOnly: true,
};

export const editorSlice = createSlice({
  name: "editor",
  initialState: initialEditorState,
  reducers: {
    memoryMapLoaded: (state, action) => {
      return {
        ...state,
        memoryMap: action.payload.memoryMap,
        pristineMemoryMap: action.payload.memoryMap,
      };
    },
    clearMemoryMap: (state) => {
      return {
        ...state,
        memoryMap: null,
        pristineMemoryMap: null,
      };
    },
    commandSetLoaded: (state, action) => {
      return {
        ...state,
        commandSet: action.payload,
      };
    },
    setDisplayFormat: (state, action) => {
      return {
        ...state,
        displayFormat: action.payload,
      };
    },
    setReadOnly: (state, action) => {
      return {
        ...state,
        readOnly: action.payload,
      };
    },
    modifyLowLimit: (state, action) => {
      const { commandName, parameterName, lowLimit } = action.payload;

      return {
        ...state,
        memoryMap: {
          ...state.memoryMap!,
          commands: {
            ...state.memoryMap?.commands,
            [commandName]: {
              ...state.memoryMap?.commands[commandName],
              parameters: {
                ...state.memoryMap?.commands[commandName].parameters,
                [parameterName]: {
                  ...state.memoryMap?.commands[commandName].parameters[parameterName],
                  lowLimit: lowLimit,
                },
              },
            },
          },
        },
      };
    },
    modifyValue: (state, action) => {
      const { commandName, parameterName, value } = action.payload;

      return {
        ...state,
        memoryMap: {
          ...state.memoryMap!,
          commands: {
            ...state.memoryMap?.commands,
            [commandName]: {
              ...state.memoryMap?.commands[commandName],
              parameters: {
                ...state.memoryMap?.commands[commandName].parameters,
                [parameterName]: {
                  ...state.memoryMap?.commands[commandName].parameters[parameterName],
                  value: value,
                },
              },
            },
          },
        },
      };
    },
    modifyHighLimit: (state, action) => {
      const { commandName, parameterName, highLimit } = action.payload;

      return {
        ...state,
        memoryMap: {
          ...state.memoryMap!,
          commands: {
            ...state.memoryMap?.commands,
            [commandName]: {
              ...state.memoryMap?.commands[commandName],
              parameters: {
                ...state.memoryMap?.commands[commandName].parameters,
                [parameterName]: {
                  ...state.memoryMap?.commands[commandName].parameters[parameterName],
                  highLimit: highLimit,
                },
              },
            },
          },
        },
      };
    },
    modifyOperation: (state, action) => {
      const { commandName, stationName, operation } = action.payload;

      if (!state.memoryMap || !state.memoryMap.testers) {
        return state;
      }

      const allTesterNames = Object.keys(state.memoryMap.testers);
      const testerName = allTesterNames.find((tester) => {
        const testerObject = state.memoryMap!.testers![tester];
        if (!testerObject) {
          return;
        }
        return Object.keys(testerObject).some((v) => {
          if (stationName) {
            return v.toLowerCase() === stationName.toLowerCase();
          }
          return false;
        });
      });

      if (!testerName) {
        return state;
      }

      return {
        ...state,
        memoryMap: {
          ...state.memoryMap!,
          testers: {
            ...state.memoryMap?.testers,
            [testerName]: {
              ...state.memoryMap?.testers![testerName],
              [stationName]: {
                ...state.memoryMap?.testers![testerName][stationName],
                [commandName]: operation,
              },
            },
          },
        },
      };
    },
    modifyPartNumberOverride: (state, action) => {
      const { commandName, parameterName, partNumber, overrideValue } = action.payload;

      return {
        ...state,
        memoryMap: {
          ...state.memoryMap!,
          partNumbers: {
            ...state.memoryMap?.partNumbers,
            [partNumber]: {
              ...state.memoryMap?.partNumbers![partNumber],
              [commandName]: {
                ...state.memoryMap?.partNumbers![partNumber][commandName],
                [parameterName]: overrideValue,
              },
            },
          },
        },
      };
    },
    updateTesters: (state, action) => {
      const { testers } = action.payload;

      return {
        ...state,
        memoryMap: {
          ...state.memoryMap!,
          testers: testers,
        },
      };
    },
    addCommand: (state, action) => {
      const { commandName } = action.payload;

      if (!state.memoryMap || !state.commandSet) {
        return state;
      }

      if (state.memoryMap.commands[commandName]) {
        return state;
      }

      const commandSetCommand = state.commandSet.commands[commandName];
      if (!commandSetCommand) {
        return state;
      }

      const parameters = Object.keys(commandSetCommand.parameters).reduce(
        (acc, parameterName) => {
          const parameter = commandSetCommand.parameters[parameterName];
          const datatype = parameter.type as CommandSetDataDataType;
          const { lowLimit, value, highLimit } = getDefaultParameterLimits(datatype);
          acc[parameterName] = {
            lowLimit,
            value,
            highLimit,
            defaultLowLimit: lowLimit,
            defaultValue: value,
            defaultHighLimit: highLimit,
            datatype,
            direction: parameter.direction,
          };
          return acc;
        },
        {} as Record<string, MemoryMapCommandParameter>
      );

      return {
        ...state,
        memoryMap: {
          ...state.memoryMap,
          commands: {
            ...state.memoryMap.commands,
            [commandName]: { parameters },
          },
        },
      };
    },
    removeCommand: (state, action) => {
      const { commandName } = action.payload;

      if (!state.memoryMap || !state.memoryMap.commands[commandName]) {
        return state;
      }

      const remainingCommands = Object.fromEntries(
        Object.entries(state.memoryMap.commands).filter(([name]) => name !== commandName)
      );

      const remainingTesters = state.memoryMap.testers
        ? Object.fromEntries(
            Object.entries(state.memoryMap.testers)
              .map(([testerName, stations]) => [
                testerName,
                Object.fromEntries(
                  Object.entries(stations)
                    .map(([stationName, operations]) => [
                      stationName,
                      Object.fromEntries(Object.entries(operations).filter(([name]) => name !== commandName)),
                    ])
                    .filter(([, operations]) => Object.keys(operations).length > 0)
                ),
              ])
              .filter(([, stations]) => Object.keys(stations).length > 0)
          )
        : state.memoryMap.testers;

      const remainingPartNumbers = state.memoryMap.partNumbers
        ? Object.fromEntries(
            Object.entries(state.memoryMap.partNumbers).map(([partNumber, commandOverrides]) => [
              partNumber,
              Object.fromEntries(Object.entries(commandOverrides).filter(([name]) => name !== commandName)),
            ])
          )
        : state.memoryMap.partNumbers;

      return {
        ...state,
        memoryMap: {
          ...state.memoryMap,
          commands: remainingCommands,
          testers: remainingTesters,
          partNumbers: remainingPartNumbers,
        },
      };
    },
  },
});

export const EditorActions = editorSlice.actions;
export type EditorActionsType = ActionType<typeof EditorActions>;

/** Only editable, durable fields participate; display/metadata changes are not edits. */
export const persistableMemoryMap = (document: MemoryMapDocument | null) =>
  document && {
    commands: Object.fromEntries(
      Object.entries(document.commands).map(([name, command]) => [
        name,
        {
          parameters: Object.fromEntries(
            Object.entries(command.parameters).map(([parameterName, parameter]) => [
              parameterName,
              { lowLimit: parameter.lowLimit, value: parameter.value, highLimit: parameter.highLimit },
            ])
          ),
        },
      ])
    ),
    testers: document.testers ?? {},
    partNumbers: document.partNumbers ?? {},
  };

export const EditorSelectors = {
  currentMemoryMap: (state: State) => state.Editor.present.memoryMap,
  currentCommandSet: (state: State) => state.Editor.present.commandSet,
  displayFormat: (state: State) => state.Editor.present.displayFormat,
  readOnly: (state: State) => state.Editor.present.readOnly,
  isMemoryMapModified: createSelector(
    [(state: State) => state.Editor.present.memoryMap, (state: State) => state.Editor.present.pristineMemoryMap],
    (current, baseline) => !isEqual(persistableMemoryMap(current), persistableMemoryMap(baseline))
  ),
  hasConcurrencyToken: (state: State) => Boolean(state.Editor.present.pristineMemoryMap?.concurrencyToken),
  hasUndos: (state: State) => state.Editor.past.length > 0,
  hasRedos: (state: State) => state.Editor.future.length > 0,
};
