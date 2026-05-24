import { describe, expect, it, spyOn } from "bun:test"
import * as shikiLoader from "../shiki-theme-loader"
import type { VSCodeFullTheme } from "../../atoms"

describe("loadFullTheme error handling", () => {
  it("should not throw if loadTheme throws", async () => {
    // Mock getHighlighter to return an object where loadTheme throws
    const highlighterSpy = spyOn(shikiLoader, "getHighlighter").mockResolvedValue({
      loadTheme: () => Promise.reject(new Error("Theme load failed")),
    } as any)

    const consoleSpy = spyOn(console, "error").mockImplementation(() => {})

    const theme: VSCodeFullTheme = {
      id: "test-error-theme",
      name: "Error Theme",
      type: "dark",
      colors: {},
      tokenColors: [],
    }

    // This should resolve normally, not reject
    await expect(shikiLoader.loadFullTheme(theme)).resolves.toBeUndefined()

    // Verify console.error was called
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
    highlighterSpy.mockRestore()
  })
})
