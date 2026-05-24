import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as shiki from 'shiki'
import { getHighlighter } from './shiki-theme-loader'

// Mock shiki.createHighlighter
vi.mock('shiki', () => ({
  createHighlighter: vi.fn(),
}))

describe('getHighlighter', () => {
  beforeEach(() => {
    // Reset the highlighterPromise in the module by isolating it or re-importing if needed.
    // For now we'll just mock it directly and test the singleton behavior.
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('should create highlighter only once (singleton pattern)', async () => {
    // Setup mock return value
    const mockHighlighter = {
      loadTheme: vi.fn(),
      getLoadedLanguages: vi.fn(),
      codeToHtml: vi.fn(),
      getLoadedThemes: vi.fn()
    }
    vi.mocked(shiki.createHighlighter).mockResolvedValue(mockHighlighter as any)

    // First call
    const highlighter1 = await getHighlighter()

    // Second call
    const highlighter2 = await getHighlighter()

    // Assertions
    expect(shiki.createHighlighter).toHaveBeenCalledTimes(1)
    expect(highlighter1).toBe(highlighter2)
  })
})
