import { describe, expect, it } from "vitest";
import { DirectionType } from "modules/core/types";
import { assembleMemoryMap, contentToken, MemoryMapSnapshot } from "../document";
import { validateParameterValues, validateSaveDocument } from "../validation";

function snapshot(): MemoryMapSnapshot {
  return {
    map: {
      ID: 1,
      PartNumber: "map",
      BOMRevision: "AAA",
      InternalRevision: 2,
      CommandSetID: 1,
      Description: "preserve",
    },
    isWorkingCopy: true,
    released: false,
    commandset: { ID: 1, Name: "set", Version: 1, Description: "description", FilePath: "set.cmdset" },
    definitions: [
      {
        ID: 1,
        CommandSetID: 1,
        Command: "C",
        Parameter: "P",
        DataType: "U8",
        Direction: DirectionType.MEMORY,
        DefaultLowLimit: "0",
        DefaultHighLimit: "255",
        DefaultValue: "1",
      },
      {
        ID: 2,
        CommandSetID: 1,
        Command: "C",
        Parameter: "Q",
        DataType: "string",
        Direction: DirectionType.MEMORY,
        DefaultLowLimit: "",
        DefaultHighLimit: "",
        DefaultValue: "",
      },
    ],
    data: [
      {
        ID: 1,
        MemoryMapID: 1,
        CommandSetDataID: 1,
        LL: "0",
        Value: "1",
        HL: "255",
        Description: "keep",
        Units: "unit",
      },
      { ID: 2, MemoryMapID: 1, CommandSetDataID: 2, LL: "", Value: "text", HL: "", Description: "keep too" },
    ],
    partNumbers: [
      { ID: 1, MemoryMapID: 1, PartNumber: "part-a", BOMRevision: "AAA", Description: "first" },
      { ID: 2, MemoryMapID: 1, PartNumber: "part-b", BOMRevision: "AAA", Description: "second" },
    ],
    values: [
      { ID: 1, MemoryMapDataID: 1, PartNumberID: 1, PartNumberValue: "2" },
      { ID: 2, MemoryMapDataID: 2, PartNumberID: 1, PartNumberValue: "override" },
      { ID: 3, MemoryMapDataID: 2, PartNumberID: 2, PartNumberValue: "second override" },
    ],
    stations: [{ ID: 1, TesterID: 1, TesterName: "Tester", StationName: "Station" }],
    operations: [
      { ID: 1, Operation: "OP_WRITE" },
      { ID: 2, Operation: "OP_VERIFY" },
    ],
    operationsData: [{ ID: 1, MemoryMapDataID: 1, TestStationID: 1, OperationID: 1 }],
  };
}

describe("memory map canonical assembly and validation", () => {
  it("merges every part number, command and parameter override and uses actual tester shape", () => {
    const state = snapshot();
    const document = assembleMemoryMap(state);
    expect(document.partNumbers).toEqual({
      "part-a": { C: { P: "2", Q: "override" } },
      "part-b": { C: { Q: "second override" } },
    });
    expect(document.testers).toEqual({ tester: { station: { C: "OP_WRITE" } } });
    expect(validateSaveDocument(document, state)).toEqual(document);
  });

  it("hashes content deterministically, including hidden anchors and metadata", () => {
    const state = snapshot();
    const reordered = {
      ...state,
      data: [...state.data].reverse(),
      definitions: [...state.definitions].reverse(),
      values: [...state.values].reverse(),
    };
    expect(contentToken(reordered)).toBe(contentToken(state));
    expect(contentToken({ ...state, data: state.data.map((row) => ({ ...row, Description: "changed" })) })).not.toBe(
      contentToken(state)
    );
    expect(contentToken({ ...state, operationsData: [{ ...state.operationsData[0], MemoryMapDataID: 2 }] })).not.toBe(
      contentToken(state)
    );
  });

  it("rejects ambiguous per-parameter operations rather than last-row-wins", () => {
    const state = snapshot();
    state.operationsData.push({ ID: 2, MemoryMapDataID: 2, TestStationID: 1, OperationID: 2 });
    expect(() => assembleMemoryMap(state)).toThrow("Conflicting per-parameter operations");
  });

  it("normalizes legacy SQL null values but includes raw nulls in the token", () => {
    const state = snapshot();
    Object.assign(state.data[0], { LL: null, Value: null, HL: null });
    Object.assign(state.values[0], { PartNumberValue: null });
    const document = assembleMemoryMap(state);
    expect(document.commands.C.parameters.P).toMatchObject({ lowLimit: "", value: "", highLimit: "" });
    expect(document.partNumbers["part-a"].C.P).toBe("");
    expect(validateSaveDocument(document, state)).toEqual(document);
    const token = document.concurrencyToken;
    Object.assign(state.data[0], { LL: "", Value: "", HL: "" });
    expect(contentToken(state)).not.toBe(token);
  });

  it("permits legacy query projection of duplicate direction keys while saves reject ambiguity", () => {
    const state = snapshot();
    state.definitions.push({ ...state.definitions[0], ID: 3, Direction: DirectionType.OUTPUT });
    expect(assembleMemoryMap(state, false).commands.C.parameters.P.value).toBe("1");
    expect(() => assembleMemoryMap(state)).toThrow("Ambiguous commandset parameter");
  });

  it.each([
    ["U8", "256", "0", "255"],
    ["S8", "-129", "-128", "127"],
    ["U16[2]", "1", "0 0", "65535 65535"],
    ["U8", "12x", "0", "255"],
    ["U8", "1.5", "0", "255"],
    ["F32", "NaN", "0", "255"],
    ["U8", "1", "10", "2"],
    ["U8", "20", "0", "10"],
  ])("rejects invalid %s value %s", (datatype, value, lowLimit, highLimit) => {
    expect(() => validateParameterValues(datatype, { value, lowLimit, highLimit }, "parameter")).toThrow();
  });

  it("accepts signed arrays, floating point, strings and unspecified numeric fields", () => {
    validateParameterValues("S8[2]", { value: "-128 127", lowLimit: "-128 -128", highLimit: "127 127" }, "P");
    validateParameterValues("F32", { value: "0.25", lowLimit: "-1.5", highLimit: "1e2" }, "P");
    validateParameterValues("string", { value: "hello", lowLimit: "", highLimit: "" }, "P");
    validateParameterValues("U8", { value: "", lowLimit: "", highLimit: "" }, "P");
  });

  it.each([
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.version++;
    },
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.commands.C.parameters.P.datatype = "U16";
    },
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.commands.C.parameters.P.extra = "lost";
    },
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.commands.Empty = { parameters: {} };
    },
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.testers.tester.station = {};
    },
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.testers.empty = {};
    },
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.partNumbers["new-part"] = {};
    },
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.partNumbers["part-a"].Missing = { P: "1" };
    },
    (doc: ReturnType<typeof assembleMemoryMap>) => {
      doc.partNumbers["part-a"].C.P = "300";
    },
  ])("rejects immutable, unknown, unrepresentable and invalid override changes", (modify) => {
    const state = snapshot();
    const doc = assembleMemoryMap(state);
    modify(doc);
    expect(() => validateSaveDocument(doc, state)).toThrow();
  });
});
