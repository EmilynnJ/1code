import { expect, test, describe } from "bun:test";
import { isBuiltinTheme } from "./vscode-themes";

describe("isBuiltinTheme", () => {
  test("returns true for known built-in theme", () => {
    expect(isBuiltinTheme("dark-plus")).toBe(true);
  });

  test("returns false for unknown theme", () => {
    expect(isBuiltinTheme("unknown")).toBe(false);
  });
});
