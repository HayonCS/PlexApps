import path from "path";
import { rimrafSync } from "rimraf";
import { svnCheckout } from "subversion/util";
import { promisify } from "util";
import * as childProcess from "child_process";

const exec = promisify(childProcess.exec);

const createRepo = async (repoName: string) => {
  return await exec(`svnadmin create --pre-1.6-compatible /home/svn/${repoName}`);
};

const fixRepoOwnership = async (repoName: string) => {
  return await exec(`chmod o+rwx -R /home/svn/${repoName}`);
};

const copySeedFilesToRepository = async (repoDirectory: string, seedDataFiles: string[]) => {
  return await Promise.all(
    seedDataFiles.map(async (seedDataFile) => {
      return exec(`cp -r ${seedDataFile} ${repoDirectory}`);
    })
  );
};

const commitFilesToSvn = async (repoDirectory: string) => {
  return await exec(
    `cd ${repoDirectory} && svn cleanup && svn add * && svn commit -m 'Add stuff' --username user --password password`
  );
};

export const subversionLocalRepoDirectory = (repoName: string) => {
  return path.join("/home", "svn", repoName);
};

export const subversionCheckoutDirectory = (repoName: string) => {
  return path.join("/tmp", repoName);
};

export const cleanUpSubversionRepoDirectory = (subversionDirectory: string) => {
  rimrafSync(subversionDirectory);
};

export const seedSubversionData = async (repoName: string, ...seedDataFiles: string[]) => {
  const subversionRepoDirectory = subversionLocalRepoDirectory(repoName);

  await cleanUpSubversionRepoDirectory(subversionRepoDirectory);
  await createRepo(repoName);
  await fixRepoOwnership(repoName);
  const checkoutDirectory = subversionCheckoutDirectory(repoName);
  rimrafSync(checkoutDirectory);

  await svnCheckout(`http://subversion/svn/${repoName}/`, checkoutDirectory, {
    username: "user",
    password: "password",
  } as any);
  await copySeedFilesToRepository(checkoutDirectory, seedDataFiles);
  await commitFilesToSvn(checkoutDirectory);
};
