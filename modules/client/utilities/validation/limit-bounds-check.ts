import { DisplayFormatType } from "modules/core/types";
import { parseFormattedValue } from "./common";

export const isParameterValueWithinLimits = (
  value: string | undefined,
  lowLimit: string | undefined,
  highLimit: string | undefined,
  format: DisplayFormatType
): boolean => {
  const valueNumbers = parseFormattedValue(value, format);
  const lowNumbers = parseFormattedValue(lowLimit, format);
  const highNumbers = parseFormattedValue(highLimit, format);

  // Non-numeric data types (e.g. "string") can't be range-checked, so don't flag them as invalid.
  if (!valueNumbers || !lowNumbers || !highNumbers) {
    return true;
  }

  if (valueNumbers.length !== lowNumbers.length || valueNumbers.length !== highNumbers.length) {
    return true;
  }

  return valueNumbers.every((n, i) => n >= lowNumbers[i] && n <= highNumbers[i]);
};
