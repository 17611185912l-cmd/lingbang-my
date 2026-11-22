import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? "/lingbang-my/personal-center-2.0/";
if (!/^\/(?:[a-zA-Z0-9][a-zA-Z0-9._-]*\/)+$/.test(base) || base.includes("..")) throw new Error("Expected a project path beginning and ending with /.");
const output = path.join(root, "dist", "github-pages");

// Build with the target base without changing the protected mobile runtime.
execFileSync(process.execPath, [path.join(root, "node_modules/vite/bin/vite.js"), "build", "--base", base, "--outDir", output], { cwd: root, stdio: "inherit" });
const files = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
for (const file of files(output)) {
  if (!/\.(js|css|html|svg)$/.test(file)) continue;
  const original = fs.readFileSync(file, "utf8");
  // Public assets referenced by JSX/runtime strings are not rebased by Vite.
  const rebased = original.replace(/(?<![\w./-])\/(assets|docs)\//g, (_, directory) => `${base}${directory}/`)
    .replace(/href=(["'])\/\1/g, `href="${base}"`);
  fs.writeFileSync(file, rebased);
  if (/(?<![\w./-])\/(assets|docs)\//.test(rebased)) throw new Error(`Unrebased root path in ${file}`);
}
fs.writeFileSync(path.join(output, ".nojekyll"), "");
console.log(`GitHub Pages output: ${output}; base: ${base}`);
