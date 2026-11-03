import { describe, expect, it } from "vitest";
import { toStorageValue } from "../storage-value";

describe("canonical grid storage values", () => {
  it("converts numeric formats and arrays", () => {
    expect(toStorageValue("0x0A 0xFF", "HEXADECIMAL", "U8[2]")).toBe("10 255");
    expect(toStorageValue("00001010 11111111", "BINARY", "U8[2]")).toBe("10 255");
    expect(toStorageValue("A   B", "ASCII", "U8[3]")).toBe("65 32 66");
    expect(toStorageValue(" ", "ASCII", "U8")).toBe("32");
    expect(toStorageValue("-0x0A", "HEXADECIMAL", "S16")).toBe("-10");
  });
  it("preserves strings, floats, blanks, and nonnumeric input for server validation", () => {
    expect(toStorageValue("hello world", "ASCII", "string")).toBe("hello world");
    expect(toStorageValue("1.25", "DECIMAL", "F32")).toBe("1.25");
    expect(toStorageValue("", "HEXADECIMAL", "U8")).toBe("");
    expect(toStorageValue("0x10junk", "HEXADECIMAL", "U16")).toBe("0x10junk");
  });
});
