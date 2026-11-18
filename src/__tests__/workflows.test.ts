/**
 * @vitest-environment node
 *
 * Checks the GitHub Actions workflows in .github/workflows.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const workflow = (file: string): string => readFileSync(resolve(root, ".github/workflows", file), "utf8");

describe("workflows", () => {
  // package-lock.json is written by npm 11, which leaves typescript-eslint's unmet optional peer
  // `@typescript/native` (it wants a 7.1 nightly) alone. npm 10, which ships with Node 22, tries
  // to nest the newest nightly instead, so its `npm ci` rejects the lockfile as out of sync.
  test.each(["node.js.yml", "publish.yml"])("install with npm 11 in the %s workflow", file => {
    const text = workflow(file);
    const installs = text.match(/- run: npm ci\r?\n/g) ?? [];
    const upgraded = text.match(/- run: npm install -g npm@11[^\S\r\n]*(#[^\r\n]*)?\r?\n(\s*#[^\r\n]*\r?\n)*\s*- run: npm ci\r?\n/g) ?? [];

    expect(installs.length).toBeGreaterThan(0);
    expect(upgraded.length).toBe(installs.length);
  });

  // The Node 18 and 20 jobs run npm 10 and must not install: they only run the smoke tests
  // against the bundles the build job made, which need nothing from node_modules.
  test.each(["node.js.yml", "publish.yml"])("smoke-tests without installing in the %s workflow", file => {
    const smoke = workflow(file).split(/^ {2}smoke:\r?\n/m)[1]?.split(/^ {2}\S/m)[0] ?? "";

    expect(smoke).toMatch(/node-version: \[18\.x, 20\.x\]/);
    expect(smoke).toMatch(/- run: npm run test:smoke/);
    expect(smoke).not.toMatch(/- run: npm (ci|install|i)\b/);
  });
});
