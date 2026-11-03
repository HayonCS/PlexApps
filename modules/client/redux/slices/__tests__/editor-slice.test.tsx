import * as React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "../../store";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Dashboard } from "@mui/icons-material";
import { EditorActions, editorSlice, EditorState } from "../editor-slice";
import { MEMORYMAP_FOR_TESTING } from "modules/client/test-helpers/memorymap";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: {
    Authentication: {
      type: "Authenticated",
      user: {
        readOnly: false,
        userName: "bill.brasky",
        distinguishedName: "CN=Brasky\\, Bill,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
        principalName: "bill.brasky@gentex.com",
        employeeNumber: 69,
        firstName: "Bill",
        lastName: "Brasky",
        formattedName: "Brasky, Bill",
        department: "Test and Measurement",
        emailAddress: "bill.brasky@gentex.com",
        mobilePhone: "9895684589",
        gentexPhone: "+1 (616) 7721590 x2345",
        sid: "S-1-5-21-56231545-804616388-477645130-30460",
        pager: "19992",
        manager: "CN=Meyer\\, Oscar,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
      },
    },
  },
});

const EditorSliceProvider = mockProvider({
  reduxStore: store,
  initialHistoryStack: "/305-0195-000/BBB/4",
  logMissingMocks: true,
});

describe("Editor Slice", () => {
  beforeEach(async () => {
    render(
      <EditorSliceProvider>
        <Dashboard />
      </EditorSliceProvider>
    );
  });

  it("Loads a memory map correctly into redux.", async () => {
    const editorState: EditorState = {
      memoryMap: null,
      pristineMemoryMap: null,
      displayFormat: "DECIMAL",
      commandSet: null,
      readOnly: false,
    };

    const newState = editorSlice.reducer(
      editorState,
      EditorActions.memoryMapLoaded({ memoryMap: MEMORYMAP_FOR_TESTING })
    );

    expect(newState).toEqual({
      memoryMap: MEMORYMAP_FOR_TESTING,
      pristineMemoryMap: MEMORYMAP_FOR_TESTING,
      displayFormat: "DECIMAL",
      commandSet: null,
      readOnly: false,
    } as EditorState);
  });
});
