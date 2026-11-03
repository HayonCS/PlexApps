import { QueryResolvers } from "modules/graphql-api/server-types.gen";
import { RepositoriesPort } from "modules/records";
import { ActiveDirectoryPort } from "modules/rest-endpoints/active-directory/port";
import { EmployeePicturePort } from "modules/rest-endpoints/employee-picture/port";
import { readMemoryMap } from "modules/domain-services/memory-map-save/document";
import { UserSettingsPort } from "modules/domain-services/user-settings/port";
import { UserNamePort } from "modules/context/ports";
import { RecentMemoryMapsPort } from "modules/domain-services/recent-memory-maps/port";
import { SubversionPort } from "modules/subversion/port";
import { svnRepositoryInfo } from "modules/subversion/repository-info";
import { CommandSetPort } from "modules/commandset/port";
import fs from "fs";
import { Logger } from "modules/atomic-object/logger";
import * as _ from "lodash-es";
import { SavedMemoryMapsRecord } from "modules/records/memorymaps";
import { FreshservicePort } from "modules/domain-services/freshservice/port";
import * as promRegistry from "modules/server/prom-registry";

const queryResolvers: QueryResolvers = {
  getAllMemoryMaps: (parent, args, ctx) => {
    return ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      const allMemoryMaps = await domainRepos.memoryMaps.getAllMemoryMaps();

      const sorted = _.orderBy(allMemoryMaps, ["PartNumber", "BOMRevision", "InternalRevision"], ["asc", "asc", "asc"]);

      // Track version counts for each memory map
      const versionCounts = new Map<string, number>();
      sorted.forEach((mm) => {
        const key = `${mm.PartNumber}-${mm.BOMRevision}`;
        versionCounts.set(key, (versionCounts.get(key) || 0) + 1);
      });

      // Update Prometheus metrics with version counts
      versionCounts.forEach((count, key) => {
        promRegistry.updateMemoryMapVersionCount(key, count);
      });

      const sortedWithWCAdded = sorted.map((value: SavedMemoryMapsRecord, index) => {
        const nextMM = sorted.at(index + 1);
        if (nextMM) {
          if (nextMM.PartNumber !== value.PartNumber || nextMM.BOMRevision !== value.BOMRevision) {
            return {
              ...value,
              IsWorkingCopy: true,
            };
          } else {
            return {
              ...value,
              IsWorkingCopy: false,
            };
          }
        } else {
          return {
            ...value,
            IsWorkingCopy: true,
          };
        }
      });

      return sortedWithWCAdded;
    });
  },
  getMemoryMap: (parent, args, ctx) => {
    const endTimer = promRegistry.startMemoryMapLoadTimer(args.memoryMapName);

    const load = async () => {
      try {
        // The document and token must describe one consistent persisted snapshot.
        const memoryMap = await ctx
          .get(RepositoriesPort)
          .transaction((repos) => readMemoryMap(repos, args), "SERIALIZABLE");
        if (!memoryMap) return null;
        promRegistry.trackMemoryMapLoad(args.memoryMapName, args.bomRevision, args.version);
        const contextUserName = ctx.get(UserNamePort);
        if (contextUserName) {
          promRegistry.trackUserAction(contextUserName, "view", "memory_map");

          await ctx
            .get(RecentMemoryMapsPort)
            .saveRecentMemoryMap(contextUserName, args.memoryMapName, args.bomRevision, args.version);
        }

        return memoryMap;
      } finally {
        endTimer();
      }
    };
    return load();
  },
  getActiveDirectoryGroupMembers: (parent, args, ctx) => {
    return ctx
      .get(ActiveDirectoryPort)
      .getActiveDirectoryGroupMembers(
        args.groupName,
        args.searchBy,
        args.groupType,
        args.recursive !== null && args.recursive !== undefined ? args.recursive : false
      );
  },
  getActiveDirectoryUsers: (parent, args, ctx) => {
    return ctx.get(ActiveDirectoryPort).getActiveDirectoryUsers(args.searchString);
  },
  getActiveDirectoryUser: (parent, args, ctx) => {
    return ctx.get(ActiveDirectoryPort).getActiveDirectoryUser(args.searchString);
  },
  getEmployeePicture: (parent, args, ctx) => {
    return ctx.get(EmployeePicturePort).getEmployeePicture(args.employeeNumber);
  },
  getUserSettings: (parent, args, ctx) => {
    const contextUserName = ctx.get(UserNamePort);
    if (contextUserName) {
      promRegistry.trackUserAction(contextUserName, "view", "user_settings");
    }
    return ctx.get(UserSettingsPort).getUserSettings(args.userName);
  },
  getRecentMemoryMaps: (parent, args, ctx) => {
    const contextUserName = ctx.get(UserNamePort);
    if (contextUserName) {
      promRegistry.trackUserAction(contextUserName, "view", "recent_memory_maps");
    }
    return ctx.get(RecentMemoryMapsPort).getRecentMemoryMaps(args.userName);
  },
  getAllCommandSets: async (parent, args, ctx) => {
    const repoNameOverride = `${svnRepositoryInfo.repoName}`;
    const subversion = await ctx.get(SubversionPort).repo({
      repoNameOverride: repoNameOverride,
    });

    const entries = await subversion.getEntries();

    const filteredEntries = entries
      .map((entry) => {
        if (entry.name.endsWith(".tcmdset") || entry.name.endsWith(".cmdset") || entry.name.endsWith(".xml")) {
          return entry.name;
        }
        return "";
      })
      .filter((n) => n)
      .sort();

    return filteredEntries;
  },
  getCommandSet: async (parent, args, ctx) => {
    const contextUserName = ctx.get(UserNamePort);
    if (contextUserName) {
      promRegistry.trackUserAction(contextUserName, "view", "command_set");
    }

    const commandSetRepoPath = `${svnRepositoryInfo.repoName}`;

    const commandSetEntry = (
      await ctx.get(SubversionPort).repo({ repoNameOverride: commandSetRepoPath }).getEntries()
    ).find((entry) => {
      if (entry.name.includes(args.name)) {
        return entry.path;
      }
    });

    if (commandSetEntry) {
      const [fileName, extension] = commandSetEntry.name.split(".");
      const pathToSave = `/tmp/${fileName}_${args.revision}.${extension}`;

      try {
        if (fs.existsSync(pathToSave)) {
          fs.rmSync(pathToSave);
        }
      } catch (e) {
        Logger.info(e);
      }

      await ctx
        .get(SubversionPort)
        .repo({ repoNameOverride: commandSetRepoPath })
        .exportFile(`${commandSetRepoPath}${commandSetEntry.path}@${args.revision}`, pathToSave, args.revision)
        .catch((e) => {
          console.info(`Error exporting ${commandSetEntry.name} at revision ${args.revision}!`, e);
        });

      const commandSetDocumentResponse = await ctx.get(CommandSetPort).getCommandSetDocument(pathToSave);
      const document = JSON.parse(commandSetDocumentResponse.stdout);

      return document;
    } else {
      return {};
    }
  },
  isWorkingCopyMemoryMap: async (parent, args, ctx) => {
    return ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      return domainRepos.memoryMaps.isWorkingCopy(args.memoryMapName, args.bomRevision, args.version);
    });
  },
  isMemoryMapReleased: async (parent, args, ctx) => {
    return ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      return domainRepos.releasedMemoryMaps.isMemoryMapReleased(args.memoryMapName, args.bomRevision, args.version);
    });
  },
  getReleasedMemoryMapInformation: async (parent, args, ctx) => {
    return ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      return domainRepos.releasedMemoryMaps.getReleasedMemoryMapInformation(
        args.memoryMapName,
        args.bomRevision,
        args.version
      );
    });
  },
  getFreshserviceGTMCatalogId: (parent, args, ctx): number | null => {
    return ctx.get(FreshservicePort).getGTMCatalogId(args.catalog) ?? null;
  },
  getAllTesters: (parent, args, ctx) => {
    return ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      return domainRepos.testers.getAllTesters();
    });
  },
  getTestStationsForTester: (parent, args, ctx) => {
    return ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      return domainRepos.testStations.getTestStationsForTester(args.testerId);
    });
  },
  getAllTestersAndTestStations: (parent, args, ctx) => {
    const testersWithStations = ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      const testers = await domainRepos.testers.getAllTesters();

      const testersAndStations = testers.map(async (tester) => {
        const testStations = await domainRepos.testStations.getTestStationsForTester(tester.id);

        return {
          testerName: tester.testerName,
          description: tester.description,
          image: tester.image,
          testStations: testStations.map((testStation) => {
            return {
              stationName: testStation.StationName,
              description: testStation.Description,
            };
          }),
        };
      });
      return testersAndStations;
    });
    return testersWithStations;
  },
};

export default queryResolvers;
