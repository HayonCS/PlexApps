import { apolloClientAdapter, ApolloClientStatePort } from "atomic-object/apollo-client";
import { ApolloClientPort } from "atomic-object/apollo-client/ports";
import { cacheAdapter, cacheStoreAdapter } from "atomic-object/cache";
import { CachePort, CacheStorePort } from "atomic-object/cache/ports";
import * as Hexagonal from "atomic-object/hexagonal";
import { PortType } from "atomic-object/hexagonal/ports";
import * as Recipe from "atomic-object/hexagonal/recipe";
import { BullJobRunner } from "atomic-object/jobs/bull-runner";
import { JobRunnerPort, JobRunnerPortType } from "atomic-object/jobs/ports";
import * as Logger from "atomic-object/logger";
import { BaseLoggerPort, LoggerPort } from "atomic-object/logger/ports";
import { ClientState } from "client/graphql/state-link";
import { NodeEnvironmentAdapter, NodeEnvironmentPort } from "node-environment";
import { KnexPort } from "atomic-object/records/knex/ports";
import * as db from "../db";
import {
  RedisPrefixAdapter,
  RedisPrefixPort,
  UserNameAdapter,
  UserNamePort,
  AppKeyPort,
  AppKeyAdapter,
  SubversionSuffixAdapter,
  SubversionSuffixPort,
  MemoryMapSaveAuthorization,
  MemoryMapSaveAuthorizationPort,
  memoryMapSaveAuthorizationAdapter,
} from "./ports";
import { MesSecurityPort } from "rest-endpoints/mes-security/port";
import { mesSecurityAdapter } from "rest-endpoints/mes-security";
import { EmployeePicturePort } from "modules/rest-endpoints/employee-picture/port";
import { employeePictureAdapter } from "modules/rest-endpoints/employee-picture";
import { CacheStore } from "modules/atomic-object/cache/types";
import { repositoriesAdapter, RepositoriesPort } from "modules/records";
import { ActiveDirectoryPort } from "modules/rest-endpoints/active-directory/port";
import { activeDirectoryAdapter } from "modules/rest-endpoints/active-directory";
import { userSettingsAdapter } from "modules/domain-services/user-settings";
import { UserSettingsPort } from "modules/domain-services/user-settings/port";
import { recentMemoryMapsAdapter } from "modules/domain-services/recent-memory-maps";
import { RecentMemoryMapsPort } from "modules/domain-services/recent-memory-maps/port";
import { subversionAdapter } from "modules/subversion";
import { SubversionPort } from "modules/subversion/port";
import { CommandSetPort } from "modules/commandset/port";
import { AppLoggingPort } from "modules/domain-services/app-logging/port";
import { appLoggingAdapter } from "modules/domain-services/app-logging";
import { commandSetAdapter } from "modules/commandset";
import { FreshservicePort } from "domain-services/freshservice/port";
import { freshserviceAdapter } from "domain-services/freshservice";
import { MemoryMapSavePort, memoryMapSaveAdapter } from "modules/domain-services/memory-map-save";

export type ContextOpts = {
  db?: db.Knex;
  initialState?: ClientState;
  smbPrefix?: string;
  redisPrefix?: string;
  subversionSuffix?: string;
  redisDisabled?: boolean;
  jobs?: PortType<JobRunnerPortType>;
  logger?: Logger.Type;
  cacheStore?: CacheStore;
  portDefaults?: Recipe.Recipeable<any>;
  userName?: string | undefined;
  appKey?: string | undefined;
  memoryMapSaveAuthorization?: MemoryMapSaveAuthorization;
};

// Note: The order of these `add` calls matters. You must ensure that
// all dependencies are added above the Port that depends on them.
const ContextBase = Hexagonal.contextClass((c) =>
  c
    .add(NodeEnvironmentPort, NodeEnvironmentAdapter)
    .add(BaseLoggerPort, Logger.baseLoggerAdapter)
    .add(LoggerPort, Logger.loggerAdapter)
    .add(ApolloClientStatePort, () => {})
    .add(ApolloClientPort, apolloClientAdapter)
    .add(KnexPort, () => db.getConnection())
    .add(RepositoriesPort, repositoriesAdapter)
    .add(RedisPrefixPort, RedisPrefixAdapter)
    .add(CacheStorePort, cacheStoreAdapter)
    .add(CachePort, cacheAdapter)
    .add(UserNamePort, UserNameAdapter)
    .add(AppKeyPort, AppKeyAdapter)
    .add(MemoryMapSaveAuthorizationPort, memoryMapSaveAuthorizationAdapter)
    .add(MemoryMapSavePort, memoryMapSaveAdapter)
    .add(JobRunnerPort, (ctx) => {
      return new BullJobRunner(ctx.get(RedisPrefixPort) || "", ctx.get(UserNamePort), ctx.get(AppKeyPort), () =>
        ctx.clone()
      );
    })
    .add(MesSecurityPort, mesSecurityAdapter)
    .add(ActiveDirectoryPort, activeDirectoryAdapter)
    .add(EmployeePicturePort, employeePictureAdapter)
    .add(UserSettingsPort, userSettingsAdapter)
    .add(RecentMemoryMapsPort, recentMemoryMapsAdapter)
    .add(AppLoggingPort, appLoggingAdapter)
    .add(SubversionSuffixPort, SubversionSuffixAdapter)
    .add(SubversionPort, subversionAdapter)
    .add(CommandSetPort, commandSetAdapter)
    .add(FreshservicePort, freshserviceAdapter)
);

/** The graphql context type for this app.  */
export class Context extends ContextBase {
  constructor(opts: ContextOpts = {}) {
    super({
      portDefaults:
        (opts.portDefaults as any) ||
        ((x) =>
          x
            .add(KnexPort, () => opts.db)
            .add(BaseLoggerPort, () => opts.logger)
            .add(ApolloClientStatePort, () => opts.initialState || undefined)
            .add(CacheStorePort, () => opts.cacheStore)
            .add(JobRunnerPort, () => opts.jobs)
            .add(RedisPrefixPort, () => opts.redisPrefix)
            .add(UserNamePort, () => opts.userName)
            .add(MemoryMapSaveAuthorizationPort, () => opts.memoryMapSaveAuthorization)
            .add(AppKeyPort, () => opts.appKey)),
    });
  }

  domainDb(): db.Knex {
    return db.getConnection();
  }

  get jobs() {
    return this.get(JobRunnerPort);
  }

  get logger(): Logger.Type {
    return this.get(LoggerPort);
  }
  get repos() {
    return this.get(RepositoriesPort);
  }

  get mesSecurity() {
    return this.get(MesSecurityPort);
  }

  get activeDirectory() {
    return this.get(ActiveDirectoryPort);
  }

  get apolloClient() {
    return this.get(ApolloClientPort);
  }

  get redisPrefix() {
    return this.get(RedisPrefixPort);
  }

  get cache() {
    return this.get(CachePort);
  }

  get freshservice() {
    return this.get(FreshservicePort);
  }

  async destroy() {
    // currently a noop
  }
}

export class ApiContext extends Context {}
