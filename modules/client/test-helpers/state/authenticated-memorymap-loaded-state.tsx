import { State } from "modules/client/redux/store";
import { AuthenticatedUser } from "../user";
import MEMORYMAP_FOR_TESTING from "../memorymap";
import { COMMANDSET_FOR_TESTING } from "../commandset";

export const AuthenticatedAndMemoryMapLoadedState: Partial<State> = {
  Authentication: {
    type: "Authenticated",
    user: AuthenticatedUser,
  },
  Editor: {
    past: [],
    present: {
      memoryMap: MEMORYMAP_FOR_TESTING,
      pristineMemoryMap: MEMORYMAP_FOR_TESTING,
      displayFormat: "DECIMAL",
      commandSet: COMMANDSET_FOR_TESTING,
      readOnly: false,
    },
    future: [],
  },
};

export const AuthenticatedAndReadOnlyMemoryMapLoadedState: Partial<State> = {
  Authentication: {
    type: "Authenticated",
    user: AuthenticatedUser,
  },
  Editor: {
    past: [],
    present: {
      memoryMap: MEMORYMAP_FOR_TESTING,
      pristineMemoryMap: MEMORYMAP_FOR_TESTING,
      displayFormat: "DECIMAL",
      commandSet: COMMANDSET_FOR_TESTING,
      readOnly: true,
    },
    future: [],
  },
};
