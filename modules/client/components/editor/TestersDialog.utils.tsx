import { Testers } from "modules/core/schemas/memory-map.gen";
import * as React from "react";

export interface StationItem {
  testerName: string;
  stationName: string;
  testerDescription: string;
  stationDescription: string;
  checked: boolean;
}

export interface Tester {
  testerName: String;
  description: String;
  image?: number;
}

export interface TestStation {
  stationName: String;
  description: String;
}

export interface TesterWithTestStations {
  testerName: String;
  description: String;
  image?: String;
  testStations: [TestStation];
}

export const TestersDialogContext = React.createContext<{ handleToggle: (item: StationItem) => void } | null>(null);

export function GetAllStations(testers: TesterWithTestStations[]) {
  return testers.reduce<StationItem[]>((allStations, tester) => {
    if (!tester) return allStations;

    tester.testStations.forEach((station) => {
      if (!station) return;

      allStations.push({
        testerName: tester.testerName.toString(),
        stationName: station.stationName.toString(),
        testerDescription: tester.description.toString(),
        stationDescription: station.description.toString(),
        checked: false,
      });
    });

    return allStations;
  }, []);
}

export function findDifference(a: StationItem[], b: StationItem[]): StationItem[] {
  return a.filter(
    (valueA) =>
      !b.some((valueB) => valueA.testerName === valueB.testerName && valueA.stationName === valueB.stationName)
  );
}

export function intersection(a: StationItem[], b: StationItem[]): StationItem[] {
  return a.filter((valueA) =>
    b.some((valueB) => valueA.testerName === valueB.testerName && valueA.stationName === valueB.stationName)
  );
}

export function buildInitialStationLists(
  allTesters: TesterWithTestStations[],
  existingTesters: Testers | null | undefined
): { available: StationItem[]; assigned: StationItem[] } {
  const allStations = GetAllStations(allTesters);
  const assigned: StationItem[] = [];

  if (existingTesters) {
    Object.entries(existingTesters).forEach(([testerName, testerObj]) => {
      Object.keys(testerObj).forEach((stationName) => {
        const dbStation = allStations.find(
          (s) =>
            s.testerName.toLowerCase() === testerName.toLowerCase() &&
            s.stationName.toLowerCase() === stationName.toLowerCase()
        );

        assigned.push({
          testerName,
          stationName,
          testerDescription: dbStation?.testerDescription ?? "",
          stationDescription: dbStation?.stationDescription ?? "",
          checked: false,
        });
      });
    });
  }

  const available = findDifference(allStations, assigned);
  return { available, assigned };
}

export function moveCheckedItems(
  source: StationItem[],
  dest: StationItem[]
): { source: StationItem[]; dest: StationItem[] } {
  const remaining = source.filter((item) => !item.checked);
  const moved = source.filter((item) => item.checked).map((item) => ({ ...item, checked: false }));
  return { source: remaining, dest: dest.concat(moved) };
}

export function buildTestersFromStations(
  stations: StationItem[],
  existingTesters: Testers | null | undefined,
  commandNames: string[] = []
): Testers {
  const result: Testers = {};
  stations.forEach((item) => {
    const testerName = item.testerName.toLowerCase();
    const stationName = item.stationName.toLowerCase();
    if (!result[testerName]) {
      result[testerName] = {};
    }
    const existingTester = Object.entries(existingTesters ?? {}).find(
      ([name]) => name.toLowerCase() === testerName
    )?.[1];
    const existingOps = Object.entries(existingTester ?? {}).find(([name]) => name.toLowerCase() === stationName)?.[1];
    result[testerName][stationName] =
      existingOps ?? Object.fromEntries(commandNames.map((name) => [name, "OP_NOT_SET"]));
  });
  return result;
}

export function computeAvailableTesterNames(
  allTesters: ReadonlyArray<TesterWithTestStations | null | undefined> | null | undefined,
  leftItems: StationItem[]
): string[] {
  const testers = new Set<string>();
  allTesters?.forEach((t) => {
    if (t) testers.add(t.testerName.toString());
  });
  leftItems.forEach((item) => testers.add(item.testerName));
  return Array.from(testers);
}
