import fs from "fs";
import { spawnSync } from "child_process";

const v = JSON.parse(fs.readFileSync("./versions.json", "utf8"));
const deps = Object.entries(v.dependencies)
  .map(([name, version]) => `${name}@${version}`)
  .join(" ");

console.log("⚙️ Installing dependencies:\n", deps);

const result = spawnSync("pnpm", ["add", ...deps.split(" ")], {
  stdio: "inherit",
  shell: true
});

process.exit(result.status);
