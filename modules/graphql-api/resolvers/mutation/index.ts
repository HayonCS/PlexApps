import { RecentMemoryMapsPort } from "modules/domain-services/recent-memory-maps/port";
import { UserSettingsPort } from "modules/domain-services/user-settings/port";
import { AppLoggingPort } from "modules/domain-services/app-logging/port";
import * as GraphQL from "modules/graphql-api/server-types.gen";
import { FreshserviceServiceRequest } from "modules/domain-services/freshservice/freshservice";
import { FreshservicePort } from "modules/domain-services/freshservice/port";
import { RepositoriesPort } from "modules/records";
import * as promRegistry from "modules/server/prom-registry";
import { MemoryMapSavePort } from "modules/domain-services/memory-map-save";
import { SaveMemoryMapRequest } from "modules/domain-services/memory-map-save/service";
import { Context } from "modules/context";
import { MemoryMapSaveDocument } from "modules/domain-services/memory-map-save/document";

// Keep the new resolver explicitly typed until the owning agent regenerates schema types.
const mutationResolvers: GraphQL.MutationResolvers & {
  saveMemoryMap: (parent: unknown, args: SaveMemoryMapRequest, ctx: Context) => Promise<MemoryMapSaveDocument>;
} = {
  saveMemoryMap: (_parent: unknown, args: SaveMemoryMapRequest, ctx: Context) =>
    ctx.get(MemoryMapSavePort).saveMemoryMap(args),
  saveUserSettings: (parent, args, ctx) => {
    promRegistry.trackUserSettingsUpdate(args.userName);
    promRegistry.trackUserAction(args.userName, "update", "user_settings");

    return ctx.get(UserSettingsPort).saveUserSettings(args.userName, args.userSettings);
  },
  saveRecentMemoryMap: (parent, args, ctx) => {
    promRegistry.trackUserAction(args.userName, "save", "recent_memory_map");

    return ctx
      .get(RecentMemoryMapsPort)
      .saveRecentMemoryMap(args.userName, args.memoryMapName, args.bomRevision, args.version);
  },
  clearRecentMemoryMaps: (parent, args, ctx) => {
    promRegistry.trackUserAction(args.userName, "clear", "recent_memory_maps");

    return ctx.get(RecentMemoryMapsPort).clearRecentMemoryMaps(args.userName);
  },
  createFreshserviceServiceRequest: async (parent, args, ctx): Promise<FreshserviceServiceRequest | undefined> => {
    return await ctx.get(FreshservicePort).createServiceRequest(args.catalogId, args.where, args.fields);
  },
  appLogLine: (parent, args, ctx) => {
    // args.logType is now a LogType enum from the schema, so it's already validated
    const metadata = args.metadata as Record<string, string | number | boolean> | undefined;

    ctx
      .get(AppLoggingPort)
      .appLogLine(args.message, args.category, args.logType as "Info" | "Error" | "Warn", metadata);
    return true;
  },
  createTester: async (parent, args, ctx) => {
    const result = await ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      const savedTester = await domainRepos.testers.createTester(args.testerName, args.description);
      return {
        testerName: savedTester.TesterName,
        description: savedTester.Description,
        image: null,
      };
    });
    return result;
  },
  createTestStation: async (parent, args, ctx) => {
    const result = await ctx.get(RepositoriesPort).domain(async (domainRepos) => {
      // First, find the tester by name
      const tester = await domainRepos.testers.getTesterByName(args.testerName);
      if (!tester) {
        throw new Error(`Tester "${args.testerName}" not found`);
      }

      const savedTestStation = await domainRepos.testStations.createTestStation(
        tester.ID,
        args.stationName,
        args.description
      );
      return {
        stationName: savedTestStation.StationName,
        description: savedTestStation.Description,
      };
    });
    return result;
  },
};

export default mutationResolvers;
