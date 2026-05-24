import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("node-pty", () => {
	return {
		spawn: () => ({ on: () => {} }),
	};
});

vi.mock("./port-manager", () => {
    return {
        portManager: {
            registerSession: () => {},
            unregisterSession: () => {},
        }
    }
});

import { TerminalManager } from "./manager";

describe("TerminalManager.resize", () => {
	let terminalManager: TerminalManager;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		terminalManager = new TerminalManager();
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleWarnSpy.mockRestore();
	});

	it("should warn and return early when cols is negative", () => {
		terminalManager.resize({ paneId: "test-pane", cols: -1, rows: 10 });
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"[TerminalManager] Invalid resize geometry for test-pane: cols=-1, rows=10. Must be positive integers."
		);
	});

	it("should warn and return early when rows is zero", () => {
		terminalManager.resize({ paneId: "test-pane", cols: 10, rows: 0 });
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"[TerminalManager] Invalid resize geometry for test-pane: cols=10, rows=0. Must be positive integers."
		);
	});

	it("should warn and return early when cols is zero", () => {
		terminalManager.resize({ paneId: "test-pane", cols: 0, rows: 10 });
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"[TerminalManager] Invalid resize geometry for test-pane: cols=0, rows=10. Must be positive integers."
		);
	});

	it("should warn and return early when rows is negative", () => {
		terminalManager.resize({ paneId: "test-pane", cols: 10, rows: -5 });
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"[TerminalManager] Invalid resize geometry for test-pane: cols=10, rows=-5. Must be positive integers."
		);
	});

	it("should warn and return early when cols is not an integer", () => {
		terminalManager.resize({ paneId: "test-pane", cols: 10.5, rows: 10 });
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"[TerminalManager] Invalid resize geometry for test-pane: cols=10.5, rows=10. Must be positive integers."
		);
	});

	it("should warn and return early when rows is not an integer", () => {
		terminalManager.resize({ paneId: "test-pane", cols: 10, rows: 10.5 });
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"[TerminalManager] Invalid resize geometry for test-pane: cols=10, rows=10.5. Must be positive integers."
		);
	});

	it("should pass boundary validation and complain about session when valid inputs are given", () => {
		terminalManager.resize({ paneId: "test-pane", cols: 1, rows: 1 });
		// Should have passed the boundary validation and logged about the session
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"Cannot resize terminal test-pane: session not found or not alive"
		);
	});
});
