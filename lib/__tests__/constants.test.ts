import { describe, it, expect } from "vitest";

import * as constants from "../constants";

describe("constants", () => {
  it("should declare the package constants", () => {
    expect(constants).toMatchSnapshot();
  });
});
