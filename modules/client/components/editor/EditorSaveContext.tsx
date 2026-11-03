import * as React from "react";

export type EditorSaveCoordinator = {
  pending: boolean;
  conflict: boolean;
  save: () => Promise<boolean>;
  reload: () => void;
  registerCommit: (commit: () => Promise<void>) => () => void;
  setEditing?: (editing: boolean) => void;
};

// Optional context keeps standalone grids, toolbar tests, and stories compatible.
export const EditorSaveContext = React.createContext<EditorSaveCoordinator | null>(null);
export const useEditorSave = () => React.useContext(EditorSaveContext);
