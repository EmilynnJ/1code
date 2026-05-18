import { describe, it, expect, vi, beforeEach } from "vitest"
import { TerminalManager } from "../manager"
import { portManager } from "../port-manager"
import { createSession, setupInitialCommands } from "../session"
import type { TerminalSession } from "../types"

vi.mock("../port-manager", () => ({
	portManager: {
		registerSession: vi.fn(),
		unregisterSession: vi.fn(),
	},
}))

vi.mock("../session", () => ({
	createSession: vi.fn(),
	setupInitialCommands: vi.fn(),
}))

describe("TerminalManager", () => {
	let manager: TerminalManager

	beforeEach(() => {
		vi.clearAllMocks()
		manager = new TerminalManager()
	})

	describe("createOrAttach deduplication", () => {
		it("should deduplicate concurrent calls for the same paneId", async () => {
			// Setup mock to take a tiny bit of time to ensure concurrency
			let resolveSession: (value: any) => void
			const mockSessionPromise = new Promise((resolve) => {
				resolveSession = resolve
			})
			vi.mocked(createSession).mockReturnValue(mockSessionPromise as any)

			const params = { paneId: "test-pane-1", cols: 80, rows: 24 }

			// Call createOrAttach concurrently 3 times
			const p1 = manager.createOrAttach(params)
			const p2 = manager.createOrAttach(params)
			const p3 = manager.createOrAttach(params)

			// Resolve the mock session
			resolveSession!({
				pty: { onExit: vi.fn(), onData: vi.fn() },
			})

			const [res1, res2, res3] = await Promise.all([p1, p2, p3])

			// Assert that createSession was only called once
			expect(createSession).toHaveBeenCalledTimes(1)

			// Assert that all calls return the exact same underlying session result object
			expect(res1).toBe(res2)
			expect(res2).toBe(res3)
			expect(res1.isNew).toBe(true)
		})

		it("should remove from pendingSessions if creation fails", async () => {
			const error = new Error("Failed to create session")
			vi.mocked(createSession).mockRejectedValue(error)

			const params = { paneId: "test-pane-fail", cols: 80, rows: 24 }

			// Call createOrAttach, expect it to throw
			await expect(manager.createOrAttach(params)).rejects.toThrow(error)

			// After failure, pendingSessions should be cleared
			// We can verify this by calling it again and seeing createSession gets called a second time
			await expect(manager.createOrAttach(params)).rejects.toThrow(error)

			expect(createSession).toHaveBeenCalledTimes(2)
		})

		it("should reuse an existing alive session for sequential calls", async () => {
			vi.mocked(createSession).mockResolvedValue({
				pty: { onExit: vi.fn(), onData: vi.fn(), resize: vi.fn() },
				isAlive: true,
			} as any)

			const params = { paneId: "test-pane-2", cols: 80, rows: 24 }

			// First call
			const res1 = await manager.createOrAttach(params)

			// Second call (sequential)
			const res2 = await manager.createOrAttach(params)

			// Assert createSession was only called once for the initial creation
			expect(createSession).toHaveBeenCalledTimes(1)

			// Assert the second result indicates it's an existing session
			expect(res1.isNew).toBe(true)
			expect(res2.isNew).toBe(false)
		})
	})
})
