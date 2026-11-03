import * as Hexagonal from "atomic-object/hexagonal";
import { CommandSetPort } from "./port";
import { getCommandSetDocument } from "./commandset";

export type CommandSet = {
  getCommandSetDocument: (path: string) => Promise<{ stdout: string; stderr: string }>;
};

export const commandSetAdapter = Hexagonal.adapter({
  port: CommandSetPort,
  requires: [],
  build: () => {
    return {
      getCommandSetDocument: async (path: string): Promise<{ stdout: string; stderr: string }> => {
        const commandSetDocument = getCommandSetDocument(path);
        return commandSetDocument;
      },
    };
  },
});
