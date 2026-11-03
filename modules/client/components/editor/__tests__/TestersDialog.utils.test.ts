import { describe, expect, it } from "vitest";
import {
  buildInitialStationLists,
  buildTestersFromStations,
  computeAvailableTesterNames,
  GetAllStations,
  intersection,
  moveCheckedItems,
  findDifference,
  StationItem,
  TesterWithTestStations,
} from "../TestersDialog.utils";

const makeStation = (testerName: string, stationName: string, checked = false): StationItem => ({
  testerName,
  stationName,
  testerDescription: `${testerName} desc`,
  stationDescription: `${stationName} desc`,
  checked,
});

describe("GetAllStations", () => {
  it("flattens testers and their stations into StationItems", () => {
    const testers: TesterWithTestStations[] = [
      {
        testerName: "T1",
        description: "Tester 1",
        testStations: [
          { stationName: "S1", description: "Station 1" },
          { stationName: "S2", description: "Station 2" },
        ] as any,
      },
      {
        testerName: "T2",
        description: "Tester 2",
        testStations: [{ stationName: "S3", description: "Station 3" }] as any,
      },
    ];

    const result = GetAllStations(testers);

    expect(result).toEqual([
      {
        testerName: "T1",
        stationName: "S1",
        testerDescription: "Tester 1",
        stationDescription: "Station 1",
        checked: false,
      },
      {
        testerName: "T1",
        stationName: "S2",
        testerDescription: "Tester 1",
        stationDescription: "Station 2",
        checked: false,
      },
      {
        testerName: "T2",
        stationName: "S3",
        testerDescription: "Tester 2",
        stationDescription: "Station 3",
        checked: false,
      },
    ]);
  });

  it("returns an empty array when given no testers", () => {
    expect(GetAllStations([])).toEqual([]);
  });

  it("returns an empty array when testers have no stations", () => {
    const testers: TesterWithTestStations[] = [{ testerName: "T1", description: "Tester 1", testStations: [] as any }];
    expect(GetAllStations(testers)).toEqual([]);
  });

  it("skips falsy testers and falsy stations", () => {
    const testers = [
      null,
      {
        testerName: "T1",
        description: "Tester 1",
        testStations: [null, { stationName: "S1", description: "Station 1" }, undefined],
      },
      undefined,
    ] as unknown as TesterWithTestStations[];

    const result = GetAllStations(testers);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ testerName: "T1", stationName: "S1" });
  });

  it("always marks generated stations as unchecked", () => {
    const testers: TesterWithTestStations[] = [
      {
        testerName: "T1",
        description: "Tester 1",
        testStations: [{ stationName: "S1", description: "Station 1" }] as any,
      },
    ];
    expect(GetAllStations(testers).every((s) => s.checked === false)).toBe(true);
  });
});

describe("not", () => {
  it("returns items in a that are not in b (matched by testerName + stationName)", () => {
    const a = [makeStation("T1", "S1"), makeStation("T1", "S2"), makeStation("T2", "S1")];
    const b = [makeStation("T1", "S2")];

    expect(findDifference(a, b)).toEqual([makeStation("T1", "S1"), makeStation("T2", "S1")]);
  });

  it("returns all of a when b is empty", () => {
    const a = [makeStation("T1", "S1")];
    expect(findDifference(a, [])).toEqual(a);
  });

  it("returns an empty array when a is empty", () => {
    expect(findDifference([], [makeStation("T1", "S1")])).toEqual([]);
  });

  it("ignores differences in description and checked fields when matching", () => {
    const a = [makeStation("T1", "S1", false)];
    const b: StationItem[] = [
      {
        testerName: "T1",
        stationName: "S1",
        testerDescription: "different",
        stationDescription: "different",
        checked: true,
      },
    ];
    expect(findDifference(a, b)).toEqual([]);
  });

  it("does not treat items with the same stationName but different testerName as equal", () => {
    const a = [makeStation("T1", "S1")];
    const b = [makeStation("T2", "S1")];
    expect(findDifference(a, b)).toEqual(a);
  });
});

describe("intersection", () => {
  it("returns items present in both a and b (matched by testerName + stationName)", () => {
    const a = [makeStation("T1", "S1"), makeStation("T1", "S2"), makeStation("T2", "S1")];
    const b = [makeStation("T1", "S2"), makeStation("T2", "S1"), makeStation("T3", "S9")];

    expect(intersection(a, b)).toEqual([makeStation("T1", "S2"), makeStation("T2", "S1")]);
  });

  it("returns an empty array when there is no overlap", () => {
    const a = [makeStation("T1", "S1")];
    const b = [makeStation("T2", "S2")];
    expect(intersection(a, b)).toEqual([]);
  });

  it("returns an empty array when either input is empty", () => {
    expect(intersection([], [makeStation("T1", "S1")])).toEqual([]);
    expect(intersection([makeStation("T1", "S1")], [])).toEqual([]);
  });

  it("returns the items from a (not b) when they overlap", () => {
    const fromA = makeStation("T1", "S1", false);
    const fromB: StationItem = { ...makeStation("T1", "S1", true), stationDescription: "from b" };
    const result = intersection([fromA], [fromB]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(fromA);
  });
});

const dbTesters: TesterWithTestStations[] = [
  {
    testerName: "T1",
    description: "Tester 1",
    testStations: [
      { stationName: "S1", description: "Station 1" },
      { stationName: "S2", description: "Station 2" },
    ] as any,
  },
  {
    testerName: "T2",
    description: "Tester 2",
    testStations: [{ stationName: "S3", description: "Station 3" }] as any,
  },
];

describe("buildInitialStationLists", () => {
  it("puts every DB station in `available` when nothing is assigned", () => {
    const { available, assigned } = buildInitialStationLists(dbTesters, null);
    expect(assigned).toEqual([]);
    expect(available).toEqual(GetAllStations(dbTesters));
  });

  it("treats undefined existingTesters the same as null", () => {
    const { available, assigned } = buildInitialStationLists(dbTesters, undefined);
    expect(assigned).toEqual([]);
    expect(available).toEqual(GetAllStations(dbTesters));
  });

  it("moves stations referenced by the memory map into `assigned` and out of `available`", () => {
    const { available, assigned } = buildInitialStationLists(dbTesters, {
      T1: { S2: {} },
    });

    expect(assigned).toEqual([
      {
        testerName: "T1",
        stationName: "S2",
        testerDescription: "Tester 1",
        stationDescription: "Station 2",
        checked: false,
      },
    ]);
    expect(available.find((s) => s.stationName === "S2")).toBeUndefined();
    expect(available).toHaveLength(2);
  });

  it("matches DB stations case-insensitively when looking up descriptions", () => {
    const { assigned } = buildInitialStationLists(dbTesters, {
      t1: { s1: {} },
    });

    expect(assigned).toEqual([
      {
        testerName: "t1",
        stationName: "s1",
        testerDescription: "Tester 1",
        stationDescription: "Station 1",
        checked: false,
      },
    ]);
  });

  it("includes assigned stations not present in the DB with empty descriptions", () => {
    const { available, assigned } = buildInitialStationLists(dbTesters, {
      Tunknown: { Sunknown: {} },
    });

    expect(assigned).toEqual([
      {
        testerName: "Tunknown",
        stationName: "Sunknown",
        testerDescription: "",
        stationDescription: "",
        checked: false,
      },
    ]);
    // Nothing was removed from available because no DB station matched.
    expect(available).toEqual(GetAllStations(dbTesters));
  });
});

describe("moveCheckedItems", () => {
  it("moves checked items from source into dest and clears their checked flag", () => {
    const source = [makeStation("T1", "S1", true), makeStation("T1", "S2", false), makeStation("T2", "S1", true)];
    const dest = [makeStation("T3", "S9", false)];

    const result = moveCheckedItems(source, dest);

    expect(result.source).toEqual([makeStation("T1", "S2", false)]);
    expect(result.dest).toEqual([
      makeStation("T3", "S9", false),
      makeStation("T1", "S1", false),
      makeStation("T2", "S1", false),
    ]);
  });

  it("does not mutate the input arrays or items", () => {
    const checkedItem = makeStation("T1", "S1", true);
    const source = [checkedItem];
    const dest: StationItem[] = [];

    moveCheckedItems(source, dest);

    expect(source).toHaveLength(1);
    expect(checkedItem.checked).toBe(true);
    expect(dest).toHaveLength(0);
  });

  it("returns shallow copies (no shared references) when nothing is checked", () => {
    const source = [makeStation("T1", "S1", false)];
    const dest = [makeStation("T2", "S2", false)];

    const result = moveCheckedItems(source, dest);

    expect(result.source).toEqual(source);
    expect(result.dest).toEqual(dest);
    expect(result.source).not.toBe(source);
    expect(result.dest).not.toBe(dest);
  });

  it("handles empty source and dest", () => {
    expect(moveCheckedItems([], [])).toEqual({ source: [], dest: [] });
  });
});

describe("buildTestersFromStations", () => {
  it("groups stations by tester name", () => {
    const stations = [makeStation("T1", "S1"), makeStation("T1", "S2"), makeStation("T2", "S1")];

    expect(buildTestersFromStations(stations, undefined)).toEqual({
      t1: { s1: {}, s2: {} },
      t2: { s1: {} },
    });
  });

  it("preserves existing operation data for matching tester/station pairs", () => {
    const existing = {
      T1: {
        S1: { OP1: { operationName: "OP1", value: 42 } },
      },
    };
    const stations = [makeStation("T1", "S1"), makeStation("T1", "S2")];

    expect(buildTestersFromStations(stations, existing)).toEqual({
      t1: {
        s1: { OP1: { operationName: "OP1", value: 42 } },
        s2: {},
      },
    });
  });

  it("returns an empty object for an empty station list", () => {
    expect(buildTestersFromStations([], undefined)).toEqual({});
  });

  it("ignores existing operation data for stations that are no longer assigned", () => {
    const existing = {
      T1: { S1: { OP1: {} } },
      T2: { S1: { OP2: {} } },
    };
    const stations = [makeStation("T1", "S1")];

    expect(buildTestersFromStations(stations, existing)).toEqual({
      t1: { s1: { OP1: {} } },
    });
  });

  it("creates representable default operations when assigning a new station", () => {
    expect(buildTestersFromStations([makeStation("T1", "S1")], undefined, ["Command"])).toEqual({
      t1: { s1: { Command: "OP_NOT_SET" } },
    });
  });
});

describe("computeAvailableTesterNames", () => {
  it("returns the union of DB tester names and tester names from the unassigned list", () => {
    const left = [makeStation("T2", "S5"), makeStation("T3", "S6")];
    expect(computeAvailableTesterNames(dbTesters, left)).toEqual(["T1", "T2", "T3"]);
  });

  it("deduplicates names that appear in both inputs", () => {
    const left = [makeStation("T1", "S1"), makeStation("T1", "S2")];
    const result = computeAvailableTesterNames(dbTesters, left);
    expect(result).toEqual(["T1", "T2"]);
  });

  it("returns DB names only when the unassigned list is empty", () => {
    expect(computeAvailableTesterNames(dbTesters, [])).toEqual(["T1", "T2"]);
  });

  it("returns unassigned-list names only when no DB testers are provided", () => {
    const left = [makeStation("Tx", "Sx")];
    expect(computeAvailableTesterNames(null, left)).toEqual(["Tx"]);
    expect(computeAvailableTesterNames(undefined, left)).toEqual(["Tx"]);
  });

  it("skips falsy entries in the DB tester list", () => {
    const list = [null, dbTesters[0], undefined] as Array<TesterWithTestStations | null | undefined>;
    expect(computeAvailableTesterNames(list, [])).toEqual(["T1"]);
  });
});
