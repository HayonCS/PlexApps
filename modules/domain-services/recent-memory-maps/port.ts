import * as Hexagonal from "atomic-object/hexagonal";
import { RecentMemoryMaps } from ".";

export type RecentMemoryMapsPortType = typeof RecentMemoryMapsPort;
export const RecentMemoryMapsPort = Hexagonal.port<RecentMemoryMaps, "recentMemoryMaps">("recentMemoryMaps");
