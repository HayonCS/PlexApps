export type RepoItem = RepoFile | RepoDirectory;

export type RepoFile = {
  type: "file";
  name: string;
  path: string;
  version: number;
};

export type RepoDirectory = {
  type: "directory";
  name: string;
  path: string;
  version: number;
};

export const isRepoDirectory = (x: RepoItem): x is RepoDirectory => x.type === "directory";
export const isRepoFile = (x: RepoItem): x is RepoFile => x.type === "file";
