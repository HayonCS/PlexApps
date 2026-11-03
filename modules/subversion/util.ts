import * as fs from "fs";
import { promisify } from "util";
import { RepoItem } from "./repo-item";
import svnUltimate from "node-svn-ultimate";

export type SvnCheckoutOptions = {
  username: string;
  password: string;
  shell: string;
  cwd: string;
  quiet: boolean;
};

export const svnCheckout = (url: string, directory: string, config: SvnCheckoutOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    svnUltimate.commands.checkout(url, directory, config, (err: string) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

export type SvnCommitOptions = {
  username: string;
  password: string;
  shell: string;
  cwd: string;
  params: string[];
};

const promiseCommit = promisify(svnUltimate.commands.commit);

export const svnCommit = async (files: string[] | string, config: SvnCommitOptions): Promise<void> =>
  promiseCommit(files, { ...config, quiet: true });

export const svnCommitRevision = async (
  url: string,
  config: { username: string; password: string }
): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    svnUltimate.commands.info(`${url}`, config, (err: Error, info: any) => {
      err ? reject(err) : resolve(info.entry.commit["$"].revision);
    });
  });
};

export const svnHeadRevision = async (url: string, config: { username: string; password: string }): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    svnUltimate.util.getRevision(`${url}`, config, (err: Error, revision: number) => {
      err ? reject(err) : resolve(revision);
    });
  });
};

export type SvnMkdirOptions = {
  username?: string;
  password?: string;
  msg: string;
};

export const svnPathExists = async (
  url: string,
  svnConfig: { username: string; password: string }
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Suppress console output by redirecting the output streams
    const originalStdoutWrite = process.stdout.write;
    const originalStderrWrite = process.stderr.write;

    process.stdout.write = () => true;
    process.stderr.write = () => true;

    svnUltimate.commands.info(
      url,
      {
        username: svnConfig.username,
        password: svnConfig.password,
      },
      (err: Error) => {
        // Restore original console output
        process.stdout.write = originalStdoutWrite;
        process.stderr.write = originalStderrWrite;

        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      }
    );
  });
};

export const exists = (p: string) =>
  new Promise<boolean>((resolve) => {
    fs.access(p, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false);
        return;
      }

      resolve(true);
    });
  });

export const svnMkdir = async (directory: string, config: SvnMkdirOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    svnUltimate.commands.mkdir(directory, { ...config, quiet: false }, (err: Error) => {
      err ? reject(err) : resolve();
    });
  });
};

export type SvnAddOptions = {
  shell: string;
  cwd: string;
};

export const svnAdd = async (items: RepoItem[], config: SvnMkdirOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    svnUltimate.commands.add(
      items.map((f) => f.path),
      config,
      (err: Error) => {
        err ? reject(err) : resolve();
      }
    );
  });
};

export const svnExportFile = async (
  src: string,
  dest: string,
  config: { username: string; password: string; revision?: number }
): Promise<void> => {
  return new Promise((resolve, reject) => {
    svnUltimate.commands.export(
      src,
      dest,
      { username: config.username, password: config.password, revision: config.revision },
      (err: Error) => {
        err ? reject(err) : resolve();
      }
    );
  });
};
