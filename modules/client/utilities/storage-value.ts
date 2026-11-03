import { CommandSetDataDataType, DisplayFormatType } from "modules/core/types";
import { parseFormattedToken } from "./validation/common";

/** Convert display input to database decimal without corrupting text or partial numeric tokens. */
export const toStorageValue = (value: unknown, format: DisplayFormatType, datatype: CommandSetDataDataType): string => {
  const text = String(value ?? "");
  if (datatype === "string" || !text || format === "DECIMAL") return text;
  if (format === "ASCII") {
    // Display characters have a single space delimiter; the character may itself be a space.
    const chars =
      text.length % 2 === 1 && [...text].every((c, i) => i % 2 === 0 || c === " ")
        ? [...text].filter((_, i) => i % 2 === 0)
        : [...text];
    return chars.map((c) => parseFormattedToken(c, format)).join(" ");
  }
  const tokens = text.trim().split(/\s+/);
  const pattern = format === "HEXADECIMAL" ? /^-?(?:0x)?[\da-f]+$/i : /^-?[01]+$/;
  if (!tokens.every((token) => pattern.test(token))) return text;
  return tokens
    .map((token) =>
      token.startsWith("-") ? -parseFormattedToken(token.slice(1), format) : parseFormattedToken(token, format)
    )
    .join(" ");
};
