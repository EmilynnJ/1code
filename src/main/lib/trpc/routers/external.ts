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

      const hasPosition = line !== undefined;
      const positionStr = hasPosition
        ? `${path}:${line}${column !== undefined ? `:${column}` : ""}`
        : path;

      // Try common code editors in order of preference
      const editors = [
        { cmd: "code", args: hasPosition ? ["--goto", positionStr] : [path] }, // VS Code
        { cmd: "cursor", args: hasPosition ? ["--goto", positionStr] : [path] }, // Cursor
        { cmd: "subl", args: hasPosition ? [`${path}:${line}`] : [path] }, // Sublime Text
        { cmd: "atom", args: hasPosition ? [`${path}:${line}`] : [path] }, // Atom
        { cmd: "open", args: ["-t", path] }, // macOS default text editor doesn't support lines via args easily
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
