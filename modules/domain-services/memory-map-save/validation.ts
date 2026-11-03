import stringify from "json-stable-stringify";
import { buildValidator } from "modules/core/schemas";
import { getDefaultParameterLimits } from "modules/core/parameter-defaults";
import { SavedCommandSetDataRecord } from "modules/records/commandsetdata";
import { assembleMemoryMap, MemoryMapSnapshot, memoryMapError } from "./document";

export type EditableParameter = {
  lowLimit: string;
  value: string;
  highLimit: string;
  name?: string;
  datatype?: string;
  direction?: string;
  defaultLowLimit?: string;
  defaultValue?: string;
  defaultHighLimit?: string;
};
export type EditableDocument = {
  commands: Record<string, { parameters: Record<string, EditableParameter> }>;
  testers: Record<string, Record<string, Record<string, string>>>;
  partNumbers: Record<string, Record<string, Record<string, string>>>;
  name?: string;
  bomRevision?: string;
  version?: number;
  isWorkingCopy?: boolean;
  commandset?: unknown;
  concurrencyToken?: string;
  __typename?: string;
};

const names = { type: "string", minLength: 1, not: { enum: ["__proto__", "constructor", "prototype"] } };
const dictionary = (additionalProperties: object) => ({ type: "object", propertyNames: names, additionalProperties });
const string = { type: "string" };
// The legacy document schema describes testers incorrectly. This schema matches the runtime
// tester -> station -> command -> operation shape and never strips additional input properties.
const validator = buildValidator<EditableDocument>({
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["commands", "testers", "partNumbers"],
    properties: {
      name: string,
      bomRevision: string,
      version: { type: "integer" },
      isWorkingCopy: { type: "boolean" },
      commandset: { type: ["object", "null"] },
      concurrencyToken: string,
      __typename: { const: "MemoryMapDocument" },
      commands: dictionary({
        type: "object",
        additionalProperties: false,
        required: ["parameters"],
        properties: {
          parameters: dictionary({
            type: "object",
            additionalProperties: false,
            required: ["lowLimit", "value", "highLimit"],
            properties: {
              lowLimit: string,
              value: string,
              highLimit: string,
              name: string,
              datatype: string,
              direction: string,
              defaultLowLimit: string,
              defaultValue: string,
              defaultHighLimit: string,
            },
          }),
        },
      }),
      testers: dictionary(dictionary(dictionary(string))),
      partNumbers: dictionary(dictionary(dictionary(string))),
    },
  },
});

function invalid(message: string, path: string): never {
  return memoryMapError("BAD_USER_INPUT", message, path);
}

/** Strict decimal numeric parsing (not parseInt), fixed array cardinality and datatype bounds. */
export function validateParameterValues(
  datatype: string,
  parameter: Pick<EditableParameter, "lowLimit" | "value" | "highLimit">,
  path: string
): void {
  if (datatype === "string") {
    return;
  }

  const match = /^([UDSF])(8|16|32)(?:\[([1-9]\d*)\])?$/i.exec(datatype);

  if (!match) {
    memoryMapError("MEMORY_MAP_UNSUPPORTED", `Unsupported datatype ${datatype}.`, path);
  }

  const prefix = match[1].toUpperCase();
  const bits = Number(match[2]);
  const count = match[3] ? Number(match[3]) : 1;

  const signed = prefix === "S";
  const float = prefix === "F";
  const min = float ? -(bits === 32 ? 3.4028234663852886e38 : 2 ** (bits - 1)) : signed ? -(2 ** (bits - 1)) : 0;
  const max = float
    ? bits === 32
      ? 3.4028234663852886e38
      : 2 ** (bits - 1) - 1
    : signed
      ? 2 ** (bits - 1) - 1
      : 2 ** bits - 1;

  if (!Number.isSafeInteger(count) || count > 100000) {
    invalid("Invalid numeric array length.", path);
  }

  const entries = Object.entries(parameter).map(([field, value]) => {
    // Blank limits/values are representable and mean unspecified, not numeric zero.
    if (value === "") return [field, null];
    const tokens = value.trim().split(/\s+/);
    const pattern = float ? /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/ : /^[+-]?\d+$/;
    if (tokens.length !== count || tokens.some((token) => !pattern.test(token))) {
      invalid(`Expected ${count} decimal ${float ? "numbers" : "integers"} for ${datatype}.`, `${path}/${field}`);
    }
    const numbers = tokens.map(Number);

    if (numbers.some((number) => !Number.isFinite(number) || number < min || number > max)) {
      invalid(`Value is outside the ${datatype} datatype range.`, `${path}/${field}`);
    }
    return [field, numbers];
  });

  const parsed = Object.fromEntries(entries) as Record<"lowLimit" | "value" | "highLimit", number[] | null>;
  const { lowLimit, value, highLimit } = parsed;
  if (lowLimit && highLimit && lowLimit.some((low, index) => low > highLimit[index])) {
    invalid("Low limit exceeds high limit.", path);
  }
  if (
    value &&
    ((lowLimit && value.some((v, i) => v < lowLimit[i])) || (highLimit && value.some((v, i) => v > highLimit[i])))
  ) {
    invalid("Value is outside the parameter limits.", `${path}/value`);
  }
}

export function validateSaveDocument(input: unknown, snapshot: MemoryMapSnapshot): EditableDocument {
  if (!validator.isValid(input)) {
    try {
      validator.validate(input);
    } catch (error) {
      invalid(error instanceof Error ? error.message : "Invalid save document.", "document");
    }
  }
  const document = input as EditableDocument;
  const canonical = assembleMemoryMap(snapshot);
  for (const field of ["name", "bomRevision", "version", "isWorkingCopy", "commandset", "concurrencyToken"] as const) {
    if (document[field] !== undefined && stringify(document[field]) !== stringify(canonical[field])) {
      invalid(`Cannot change immutable ${field}.`, field);
    }
  }
  const definitions = new Map(snapshot.definitions.map((row) => [stringify([row.Command, row.Parameter]), row]));
  for (const [commandName, command] of Object.entries(document.commands)) {
    if (!Object.keys(command.parameters).length) {
      memoryMapError(
        "MEMORY_MAP_UNSUPPORTED",
        "Commands without parameters cannot be persisted.",
        `commands/${commandName}`
      );
    }
    for (const [name, parameter] of Object.entries(command.parameters)) {
      const path = `commands/${commandName}/parameters/${name}`;
      const definition = definitions.get(stringify([commandName, name]));
      if (!definition) invalid("Parameter does not belong to the memory map's commandset.", path);
      checkParameterMetadata(parameter, definition, snapshot, path);
      validateParameterValues(
        definition.DataType,
        {
          lowLimit: parameter.lowLimit,
          value: parameter.value,
          highLimit: parameter.highLimit,
        },
        path
      );
    }
  }
  // PartNumbers carry independently managed metadata/parent relationships. Save edits their
  // overrides only, never creates or deletes those records (including empty override containers).
  const parts = snapshot.partNumbers.map((row) => row.PartNumber).sort();
  if (stringify(Object.keys(document.partNumbers).sort()) !== stringify(parts)) {
    invalid(
      "Part number membership is immutable; include all existing part numbers, even with no overrides.",
      "partNumbers"
    );
  }
  for (const [part, commands] of Object.entries(document.partNumbers)) {
    for (const [command, parameters] of Object.entries(commands)) {
      if (!Object.keys(parameters).length) {
        memoryMapError(
          "MEMORY_MAP_UNSUPPORTED",
          "Empty command override containers cannot be persisted.",
          `partNumbers/${part}/${command}`
        );
      }
      for (const [name, value] of Object.entries(parameters)) {
        const path = `partNumbers/${part}/${command}/${name}`;
        const parameter = document.commands[command]?.parameters[name];
        const definition = definitions.get(stringify([command, name]));
        if (!parameter || !definition) invalid("Override targets a missing parameter.", path);
        if (value.length > 2000) invalid("Override exceeds the database's 2000-character limit.", path);
        validateParameterValues(
          definition.DataType,
          {
            lowLimit: parameter.lowLimit,
            value,
            highLimit: parameter.highLimit,
          },
          path
        );
      }
    }
  }
  const operationNames = new Set(snapshot.operations.map((row) => row.Operation));
  for (const [tester, stations] of Object.entries(document.testers)) {
    if (tester !== tester.toLowerCase()) {
      invalid("Tester names must use canonical lowercase spelling.", `testers/${tester}`);
    }
    if (!Object.keys(stations).length) {
      memoryMapError(
        "MEMORY_MAP_UNSUPPORTED",
        "Tester selections without stations cannot be persisted.",
        `testers/${tester}`
      );
    }
    for (const [station, commands] of Object.entries(stations)) {
      const matches = snapshot.stations.filter(
        (row) => row.TesterName.toLowerCase() === tester && row.StationName.toLowerCase() === station
      );
      if (station !== station.toLowerCase() || matches.length !== 1) {
        invalid("Unknown or ambiguous tester/station.", `testers/${tester}/${station}`);
      }
      if (!Object.keys(commands).length) {
        memoryMapError(
          "MEMORY_MAP_UNSUPPORTED",
          "Station selections without operations cannot be persisted.",
          `testers/${tester}/${station}`
        );
      }
      for (const [command, operation] of Object.entries(commands)) {
        if (!document.commands[command]) {
          invalid("Operation targets a missing command.", `testers/${tester}/${station}/${command}`);
        }
        if (!operationNames.has(operation)) {
          invalid(
            "Unknown operation; use its canonical database name (including OP_NOT_SET).",
            `testers/${tester}/${station}/${command}`
          );
        }
      }
    }
  }
  return document;
}

function checkParameterMetadata(
  parameter: EditableParameter,
  definition: SavedCommandSetDataRecord,
  snapshot: MemoryMapSnapshot,
  path: string
) {
  const canonical = {
    name: definition.Parameter,
    datatype: definition.DataType,
    direction: definition.Direction,
    defaultLowLimit: definition.DefaultLowLimit ?? "",
    defaultValue: definition.DefaultValue ?? "",
    defaultHighLimit: definition.DefaultHighLimit ?? "",
  };
  const existing = snapshot.data.some((row) => row.CommandSetDataID === definition.ID);
  // Client command-add placeholders are derived by the shared helper, not writable defaults.
  const placeholders = getDefaultParameterLimits(definition.DataType);
  for (const field of Object.keys(canonical) as (keyof typeof canonical)[]) {
    const submitted = parameter[field];
    const placeholder =
      field === "defaultLowLimit"
        ? placeholders.lowLimit
        : field === "defaultHighLimit"
          ? placeholders.highLimit
          : field === "defaultValue"
            ? placeholders.value
            : undefined;
    if (submitted !== undefined && submitted !== canonical[field] && (existing || submitted !== placeholder)) {
      invalid(`Cannot change commandset metadata ${field}.`, `${path}/${field}`);
    }
  }
}
