import * as childProcess from "child_process";
import { seedSubversionData } from "modules/helpers/subversion-seed";
import * as path from "path";
import { promisify } from "util";

const exec = promisify(childProcess.exec);

export const subversionRepoName = (subversionSuffix: string | null) => {
  return "gentex-repo" + (subversionSuffix || "");
};

export const subversionLocalRepoDirectory = (subversionSuffix: string | null) => {
  return path.join("/home", "svn", subversionRepoName(subversionSuffix));
};

export const removeSubversionDirectory = async (subversionSuffix: string | null) => {
  const subversionDirectory = subversionLocalRepoDirectory(subversionSuffix);
  await exec(`sudo /bin/rm -rf ${subversionDirectory}`);
};

export const setupSubversionRepo = async (subversionSuffix: string | null) => {
  if (process.env.NODE_ENV !== "test") {
    console.info("Refusing to modify anything but docker svn.");
    return;
  }

  await removeSubversionDirectory(subversionSuffix);
  const files = [path.resolve("entry", "scripts", "artifacts", "subversion", "commandsets")];
  await seedSubversionData(subversionRepoName(subversionSuffix), ...files);
};
