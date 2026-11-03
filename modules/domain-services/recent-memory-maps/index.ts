import * as Hexagonal from "atomic-object/hexagonal";
import { RecentMemoryMapsPort } from "./port";
import {
  getRecentMemoryMaps,
  RecentMemoryMapsResponse,
  saveRecentMemoryMapForUser,
  clearRecentMemoryMaps,
} from "./recent-memory-maps";

export type RecentMemoryMaps = {
  getRecentMemoryMaps: (userName: string) => Promise<RecentMemoryMapsResponse>;
  saveRecentMemoryMap: (
    userName: string,
    memoryMapName: string,
    bomRevision: string,
    version: number
  ) => Promise<RecentMemoryMapsResponse>;
  clearRecentMemoryMaps: (userName: string) => Promise<boolean>;
};

export const recentMemoryMapsAdapter = Hexagonal.adapter({
  port: RecentMemoryMapsPort,
  requires: [],
  build: () => {
    return {
      getRecentMemoryMaps: async (userName: string) => {
        return await getRecentMemoryMaps(userName);
      },
      saveRecentMemoryMap: async (
        userName: string,
        memoryMapName: string,
        bomRevision: string,
        version: number
      ): Promise<RecentMemoryMapsResponse> => {
        return await saveRecentMemoryMapForUser(userName, memoryMapName, bomRevision, version);
      },
      clearRecentMemoryMaps: async (userName: string): Promise<boolean> => {
        return await clearRecentMemoryMaps(userName);
      },
    };
  },
});
