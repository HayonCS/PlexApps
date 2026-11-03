import { CommandSetDataDataType } from "modules/core/types";

const NUMERIC_DATATYPE_PATTERN = /^([UDSF])(8|16|32)(?:\[(\d+)\])?$/;

/**
 * Derives placeholder low limit, value, and high limit strings for a parameter's datatype when a
 * command is added to a memory map and no device-specific defaults are available yet.
 */
export const getDefaultParameterLimits = (
  datatype: CommandSetDataDataType
): { lowLimit: string; value: string; highLimit: string } => {
  const match = NUMERIC_DATATYPE_PATTERN.exec(datatype);

  if (!match) {
    return { lowLimit: "", value: "", highLimit: "" };
  }

  const [, signPrefix, bitsString, arraySizeString] = match;
  const bits = parseInt(bitsString, 10);
  const arraySize = arraySizeString ? parseInt(arraySizeString, 10) : 1;

  const isSigned = signPrefix === "S" || signPrefix === "F";
  const min = isSigned ? -(2 ** (bits - 1)) : 0;
  const max = isSigned ? 2 ** (bits - 1) - 1 : 2 ** bits - 1;

  const repeat = (value: number): string => new Array(arraySize).fill(value).join(" ");

  return {
    lowLimit: repeat(min),
    value: repeat(0),
    highLimit: repeat(max),
  };
};
