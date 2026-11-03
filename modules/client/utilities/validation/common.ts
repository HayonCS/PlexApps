import { DisplayFormatType } from "modules/core/types";

export const parseFormattedToken = (token: string, format: DisplayFormatType): number => {
  switch (format) {
    case "HEXADECIMAL":
      return parseInt(token.replace(/^0x/i, ""), 16);
    case "BINARY":
      return parseInt(token, 2);
    case "ASCII":
      return token.length > 0 ? token.charCodeAt(0) : 32;
    case "DECIMAL":
    default:
      return parseInt(token, 10);
  }
};

/** Parses a space-separated, format-displayed parameter string into raw numbers, or null if not numeric. */
export const parseFormattedValue = (value: string | undefined, format: DisplayFormatType): number[] | null => {
  if (!value) {
    return null;
  }

  const numbers = value
    .trim()
    .split(/\s+/)
    .map((token) => parseFormattedToken(token, format));

  return numbers.some((n) => Number.isNaN(n)) ? null : numbers;
};
