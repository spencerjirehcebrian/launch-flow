#!/usr/bin/env node

import { spawn } from "child_process";
import * as path from "path";
import * as electron from "electron";

const proc = spawn(electron as any, [path.join(__dirname, "main.js")], {
  stdio: "inherit",
});

proc.on("close", (code: number) => {
  process.exit(code || 0);
});
