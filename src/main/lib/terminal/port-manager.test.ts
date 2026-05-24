import { test, expect, describe, beforeEach, afterAll } from "bun:test";
import { portManager } from "./port-manager";

describe("PortManager ignored ports filtering", () => {
	beforeEach(() => {
		// Clean up ports for the test pane
		portManager.removePortsForPane("test-pane");
	});

	afterAll(() => {
		// Stop the interval to prevent process from hanging
		portManager.stopPeriodicScan();
	});

	test("should filter out ignored ports (e.g., 22, 80) and keep valid ones", () => {
		const paneId = "test-pane";
		const workspaceId = "test-workspace";

		const portInfos = [
			{ port: 3000, pid: 100, address: "127.0.0.1", processName: "node" }, // valid
			{ port: 22, pid: 101, address: "0.0.0.0", processName: "sshd" }, // ignored
			{ port: 80, pid: 102, address: "0.0.0.0", processName: "nginx" }, // ignored
			{ port: 8080, pid: 103, address: "127.0.0.1", processName: "node" }, // valid
		];

		// Access the private updatePortsForPane method for testing
		;(portManager as any).updatePortsForPane(paneId, workspaceId, portInfos);

		const ports = portManager.getAllPorts();
		const testPanePorts = ports.filter((p) => p.paneId === paneId);

		expect(testPanePorts.length).toBe(2);

		const actualPorts = testPanePorts.map((p) => p.port).sort((a, b) => a - b);
		expect(actualPorts).toEqual([3000, 8080]);
	});

	test("should handle all ignored ports being provided", () => {
		const paneId = "test-pane";
		const workspaceId = "test-workspace";

		const portInfos = [
			{ port: 443, pid: 101, address: "0.0.0.0", processName: "https" }, // ignored
			{ port: 5432, pid: 102, address: "0.0.0.0", processName: "postgres" }, // ignored
			{ port: 3306, pid: 103, address: "127.0.0.1", processName: "mysql" }, // ignored
			{ port: 6379, pid: 104, address: "127.0.0.1", processName: "redis" }, // ignored
			{ port: 27017, pid: 105, address: "127.0.0.1", processName: "mongo" }, // ignored
		];

		// Access the private updatePortsForPane method for testing
		;(portManager as any).updatePortsForPane(paneId, workspaceId, portInfos);

		const ports = portManager.getAllPorts();
		const testPanePorts = ports.filter((p) => p.paneId === paneId);

		expect(testPanePorts.length).toBe(0);
	});
});
