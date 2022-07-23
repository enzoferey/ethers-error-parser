import { describe, it, expect } from "vitest";

import { getHabak, habak } from "../index";

describe("getHabak", () => {
  it("should return 1", () => {
    expect(getHabak()).toBe(1);
  });
});

describe("habak", () => {
  it("should return 1", () => {
    expect(habak).toBe(1);
  });
});
