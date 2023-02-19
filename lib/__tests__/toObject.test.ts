import { describe, it, expect } from "vitest";
import { toObject } from "../utils/toObject";

describe("toObject", () => {
  it("should convert an array of strings into object at which keys itself is the value", () => {
    const values = ["a", "b"] as const;
    const result = toObject(values);
    expect(result).to.be.toMatchObject({
      a: "a",
      b: "b",
    });
  });

  it("should return an empty object for an empty array", () => {
    expect(toObject([])).to.be.empty;
  });
});
