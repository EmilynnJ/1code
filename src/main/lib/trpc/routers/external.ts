import { shell } from "electron";
import { spawn } from "node:child_process";
import { z } from "zod";
import { publicProcedure, router } from "../index";

/**
 * External router for shell operations (open in finder, open in editor, etc.)
 */
export const externalRouter = router({
	openInFinder: publicProcedure
		.input(z.string())
		.mutation(async ({ input: path }) => {
			shell.showItemInFolder(path);
			return { success: true };
		}),

	openFileInEditor: publicProcedure
		.input(
			z.object({
				path: z.string(),
				cwd: z.string().optional(),
				line: z.number().optional(),
				column: z.number().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const { path, cwd, line, column } = input;

			// Construct path with line/column for editors that support it (VS Code/Cursor using -g or goto)
			const hasLine = typeof line === "number";
			const hasColumn = typeof column === "number";
			const pathWithLineCol =
				hasLine && hasColumn
					? `${path}:${line}:${column}`
					: hasLine
						? `${path}:${line}`
						: path;

			// Try common code editors in order of preference
			const editors = [
				{ cmd: "code", args: hasLine ? ["-g", pathWithLineCol] : [path] }, // VS Code
				{ cmd: "cursor", args: hasLine ? ["-g", pathWithLineCol] : [path] }, // Cursor
				{ cmd: "subl", args: hasLine ? [`${path}:${line}`] : [path] }, // Sublime Text (uses path:line format)
				{ cmd: "atom", args: hasLine ? [`${path}:${line}`] : [path] }, // Atom (uses path:line format)
				{ cmd: "open", args: ["-t", path] }, // macOS default text editor
			];

			for (const editor of editors) {
				try {
					const child = spawn(editor.cmd, editor.args, {
						cwd: cwd || undefined,
						detached: true,
						stdio: "ignore",
					});
					child.unref();
					return { success: true, editor: editor.cmd };
				} catch {
					// Try next editor
					continue;
				}
			}

			// Fallback: use shell.openPath which opens with default app
			await shell.openPath(path);
			return { success: true, editor: "default" };
		}),

	openExternal: publicProcedure
		.input(z.string())
		.mutation(async ({ input: url }) => {
			await shell.openExternal(url);
			return { success: true };
		}),
});
