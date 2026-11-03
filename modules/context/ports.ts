import * as Hexagonal from "atomic-object/hexagonal";
import config from "config";

export const RedisPrefixPort = Hexagonal.port<string | null, "redis prefix">("redis prefix");
export type RedisPrefixPortType = typeof RedisPrefixPort;

export const RedisPrefixAdapter = Hexagonal.adapter({
  port: RedisPrefixPort,
  requires: [],
  build: () => config.get<string>("redis.prefix"),
});

export const UserNamePort = Hexagonal.port<string | undefined, "User Name">("User Name");
export const UserNameAdapter = Hexagonal.adapter({
  port: UserNamePort,
  requires: [],
  build: () => undefined,
});

/** Only populated by the server after authenticating and verifying signed claims. */
export type MemoryMapSaveAuthorization = { userName: string; canWrite: boolean };
export const MemoryMapSaveAuthorizationPort = Hexagonal.port<
  MemoryMapSaveAuthorization | undefined,
  "MemoryMapSaveAuthorization"
>("MemoryMapSaveAuthorization");
export const memoryMapSaveAuthorizationAdapter = Hexagonal.adapter({
  port: MemoryMapSaveAuthorizationPort,
  requires: [],
  build: () => undefined,
});

export const AppKeyPort = Hexagonal.port<string | undefined, "App Key">("App Key");
export const AppKeyAdapter = Hexagonal.adapter({
  port: AppKeyPort,
  requires: [],
  build: () => undefined,
});

export const SubversionSuffixPort = Hexagonal.port<string, "subversion suffix">("subversion suffix");
export const SubversionSuffixAdapter = Hexagonal.adapter({
  port: SubversionSuffixPort,
  requires: [],
  build: () => "",
});
