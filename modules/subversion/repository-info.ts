import { SvnCheckoutOptions } from "subversion/util";
import config from "config";

export const svnRepositoryInfo: {
  baseUrl: string;
  repoName: string;
  svnOptions: Pick<SvnCheckoutOptions, "username" | "password">;
} = {
  baseUrl: config.get<string>("subversion.baseUrl"),
  repoName: config.get<string>("subversion.repoName"),
  svnOptions: {
    username: config.get<string>("subversion.username"),
    password: config.get<string>("subversion.password"),
  },
};
