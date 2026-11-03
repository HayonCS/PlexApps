/* eslint-disable no-prototype-builtins */
import * as Hexagonal from "atomic-object/hexagonal";
import { Logger } from "atomic-object/logger";
import { SubversionSuffixPort } from "modules/context/ports";
import { throwIfNil } from "modules/helpers/nil-helpers";
import stringify from "json-stable-stringify";
import * as _ from "lodash-es";
import { svnRepositoryInfo } from "subversion/repository-info";
import { BufferLike, createClient, FileStat, ResponseDataDetailed, WebDAVClient } from "webdav";
import { SubversionPort } from "./port";
import { RepoDirectory, RepoFile } from "./repo-item";
import { svnHeadRevision, svnCommitRevision, svnMkdir, SvnMkdirOptions, svnPathExists, svnExportFile } from "./util";

export type SubversionRepo = {
  getEntries: (
    directory?: Pick<RepoDirectory, "path">,
    args?: { recursive: boolean }
  ) => Promise<Array<RepoFile | RepoDirectory>>;
  fileExists: (file: Pick<RepoFile, "path"> & Partial<Pick<RepoFile, "version">>) => Promise<boolean>;
  pathExists: (path: string) => Promise<boolean>;
  getFileContentsAsText: (file: Pick<RepoFile, "path"> & Partial<Pick<RepoFile, "version">>) => Promise<
    | {
        type: "text";
        contents: string;
      }
    | { type: "Buffer"; contents: Buffer }
    | { type: "ArrayBuffer"; contents: ArrayBuffer }
    | { type: "object"; contents: object }
  >;
  putFileContents: (
    file: Pick<RepoFile, "path">,
    contents: { type: "text"; contents: string } | { type: "object"; contents: object }
  ) => Promise<boolean>;
  makeDirectory: (directory: Pick<RepoDirectory, "path">, options?: SvnMkdirOptions) => Promise<void>;
  deleteDirectory: (directory: Pick<RepoDirectory, "path">) => Promise<void>;
  deleteFile: (file: Omit<RepoFile, "version"> & Partial<Pick<RepoFile, "version">>) => Promise<void>;
  headRevision: () => Promise<number | null>;
  commitRevision: () => Promise<number | null>;
  exportFile: (src: string, dest: string, version?: number) => Promise<void>;
};

export type Subversion = {
  repo: (options?: { auth?: { username: string; password: string }; repoNameOverride?: string }) => SubversionRepo;
};

async function getDirectoryContents(
  client: WebDAVClient,
  args: { directory: string; recursive?: boolean | undefined }
): Promise<FileStat[]> {
  try {
    return (await client.getDirectoryContents(args.directory)) as FileStat[];
  } catch (e) {
    e;
    return [];
  }
}

const readDirectory = async (
  client: WebDAVClient,
  args: {
    directory: string;
    recursive?: boolean;
  }
): Promise<Array<RepoFile | RepoDirectory>> => {
  const directoryItems: FileStat[] = await getDirectoryContents(client, args);

  const subdirectories = directoryItems.filter((d) => d.type === "directory");

  const descendantEntries = args.recursive
    ? _.flatten(
        await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          subdirectories.map((d) => readDirectory(client, { directory: d.filename, recursive: true }))
        )
      )
    : [];

  const entries: Array<RepoFile | RepoDirectory> = await Promise.all(
    directoryItems.map(async (f) => {
      if (f.type === "file") {
        return {
          type: "file" as const,
          name: f.basename,
          path: f.filename,
          version: throwIfNil(revision(f.etag)),
        };
      }
      return {
        type: "directory" as const,
        name: f.basename,
        path: f.filename,
        version: throwIfNil(revision(f.etag)),
      };
    })
  );

  return [...descendantEntries, ...entries];
};

const hasArrayBuffer = typeof ArrayBuffer === "function";
const { toString } = Object.prototype;

function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return hasArrayBuffer && (value instanceof ArrayBuffer || toString.call(value) === "[object ArrayBuffer]");
}

const isResponseDataDetailed = <T extends any>(value: any): value is ResponseDataDetailed<T> => {
  return (
    value.hasOwnProperty("data") &&
    value.hasOwnProperty("headers") &&
    value.hasOwnProperty("status") &&
    value.hasOwnProperty("statusText")
  );
};

const withRoot = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const revision = (etag: string | null) =>
  !etag ? null : Number.parseInt(etag.replace(/^(W\/)?([0-9]+)\/(.*)$/, "$2"));

export const subversionAdapter = Hexagonal.adapter({
  port: SubversionPort,
  requires: [SubversionSuffixPort],
  build: (ctx) => {
    return {
      repo: (repoOptions) => {
        const repoSuffix = ctx.get(SubversionSuffixPort);
        const url =
          svnRepositoryInfo.baseUrl +
          repoSuffix +
          `/${
            repoOptions && repoOptions.repoNameOverride !== undefined
              ? repoOptions.repoNameOverride
              : svnRepositoryInfo.repoName
          }`;

        const svnConfig = svnRepositoryInfo.svnOptions;

        const repoAuth =
          repoOptions && repoOptions.auth
            ? repoOptions.auth
            : {
                username: svnConfig.username,
                password: svnConfig.password,
              };

        const client = createClient(url, repoAuth);

        const repository: SubversionRepo = {
          getEntries: (directory, args) => {
            const directories = readDirectory(client, {
              directory: directory ? withRoot(directory.path) : "/",
              recursive: args ? args.recursive : false,
            });
            return directories;
          },
          fileExists: async (file) => {
            return await client.exists(file.path);
          },
          getFileContentsAsText: async (file) => {
            const response = await client.getFileContents(withRoot(file.path), {
              details: true,
              format: "text",
            });

            if (typeof response === "string") {
              return {
                type: "text",
                contents: response,
              };
            }

            if (Buffer.isBuffer(response)) {
              return {
                type: "Buffer",
                contents: response,
              };
            }

            if (isArrayBuffer(response)) {
              return {
                type: "ArrayBuffer",
                contents: response,
              };
            }

            if (isResponseDataDetailed<string | BufferLike>(response)) {
              if (typeof response.data === "string") {
                return {
                  type: "text",
                  contents: response.data,
                };
              }

              if (Buffer.isBuffer(response.data)) {
                return {
                  type: "Buffer",
                  contents: response.data,
                };
              }

              if (isArrayBuffer(response.data)) {
                return {
                  type: "ArrayBuffer",
                  contents: response.data,
                };
              }

              return {
                type: "object",
                contents: response.data as object,
              };
            }

            return {
              type: "object",
              contents: response as object,
            };
          },
          putFileContents: (file, data) => {
            if (data.type === "text") {
              try {
                return client.putFileContents(withRoot(file.path), data.contents);
              } catch (e) {
                e;
                return Promise.resolve(false);
              }
            }

            return client.putFileContents(withRoot(file.path), stringify(data.contents, { space: 4 }));
          },
          makeDirectory: (directory, options) => {
            return svnMkdir(`${url}${withRoot(directory.path)}`, {
              ...repoAuth,
              msg:
                options !== undefined
                  ? `${options.username || "Username not provided"}\n\n${options.msg || "Commit message not provided"}`
                  : `Making ${withRoot(directory.path)}`,
            });
          },
          deleteDirectory: (directory) => {
            return client.deleteFile(withRoot(directory.path));
          },
          deleteFile: (file) => {
            return client.deleteFile(withRoot(file.path));
          },
          headRevision: async () => {
            try {
              const repoSuffix = await ctx.get(SubversionSuffixPort);
              const url = svnRepositoryInfo.baseUrl + repoSuffix + `/${svnRepositoryInfo.repoName}`;
              const svnConfig = svnRepositoryInfo.svnOptions;

              const headRevision = await svnHeadRevision(url, {
                username: svnConfig.username,
                password: svnConfig.password,
              });

              return headRevision;
            } catch (e) {
              Logger.error(e);

              return null;
            }
          },
          commitRevision: async () => {
            try {
              const repoSuffix = await ctx.get(SubversionSuffixPort);
              const url =
                svnRepositoryInfo.baseUrl +
                repoSuffix +
                `/${
                  repoOptions && repoOptions.repoNameOverride !== undefined
                    ? repoOptions.repoNameOverride
                    : svnRepositoryInfo.repoName
                }`;
              const svnConfig = svnRepositoryInfo.svnOptions;

              const commitRevision = await svnCommitRevision(url, {
                username: svnConfig.username,
                password: svnConfig.password,
              });

              return commitRevision;
            } catch (e) {
              Logger.error(e);

              return null;
            }
          },
          pathExists: async (path: string): Promise<boolean> => {
            try {
              const repoSuffix = ctx.get(SubversionSuffixPort);
              const url = `${svnRepositoryInfo.baseUrl}${repoSuffix}${withRoot(path)}/`;

              const doesExist = await svnPathExists(url, {
                username: svnConfig.username,
                password: svnConfig.password,
              });
              return doesExist;
            } catch (e) {
              if (e.message.includes("E160013") || e.message.includes("W170000") || e.message.includes("E200009")) {
                // Path does not exist
                return false;
              }
              // Handle other errors
              throw e;
            }
          },
          exportFile: async (src: string, dest: string, revision?: number): Promise<void> => {
            try {
              const repoSuffix = ctx.get(SubversionSuffixPort);
              const source = `${svnRepositoryInfo.baseUrl}${repoSuffix}${withRoot(src)}`;

              return svnExportFile(source, dest, {
                username: svnConfig.username,
                password: svnConfig.password,
                revision: revision,
              });
            } catch (e) {
              Logger.error(e);
            }
          },
        };
        return repository;
      },
    };
  },
});
