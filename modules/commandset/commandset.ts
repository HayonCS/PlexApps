import { execFile } from "node:child_process";
import { existsSync } from "fs";
import path from "path";
import { promisify } from "util";

export const getCommandSetDocument = async (commandsetPath: string): Promise<{ stdout: string; stderr: string }> => {
  const execFilePromise = promisify(execFile);

  const pythonPath = path.join("commandsetparser-venv", "bin", "python");
  const scriptPath = path.join("scripts", "commandset_parser.py");

  if (!existsSync(pythonPath)) {
    console.error(`Python does not exist at: `, pythonPath);
  }

  if (!existsSync(scriptPath)) {
    console.error(`Script does not exist at: `, pythonPath);
  }

  if (!existsSync(commandsetPath)) {
    console.error(`Commandset does not exist at: `, commandsetPath);
  }

  const documentPromise = execFilePromise(pythonPath, [scriptPath, commandsetPath]);
  return documentPromise;
};
