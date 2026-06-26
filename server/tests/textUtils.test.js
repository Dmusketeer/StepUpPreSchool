import { describe, expect, it } from "vitest";
import { appendNumberWhenNeeded, clean, isPlainObject, parseLimit } from "../utils/textUtils.js";

describe("textUtils", () => {
  it("cleans string values", () => {
    expect(clean("  StepUp  ")).toBe("StepUp");
    expect(clean(null)).toBe("");
  });

  it("parses and bounds limit", () => {
    expect(parseLimit("10")).toBe(10);
    expect(parseLimit("1000", 250, 300)).toBe(300);
    expect(parseLimit("0", 250, 300)).toBe(1);
    expect(parseLimit("oops", 25, 100)).toBe(25);
  });

  it("detects plain objects only", () => {
    expect(isPlainObject({ key: "value" })).toBe(true);
    expect(isPlainObject([1, 2, 3])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
  });

  it("appends index only for multi-item lists", () => {
    expect(appendNumberWhenNeeded("Photo", 1, 0)).toBe("Photo");
    expect(appendNumberWhenNeeded("Photo", 3, 1)).toBe("Photo 2");
  });
});
