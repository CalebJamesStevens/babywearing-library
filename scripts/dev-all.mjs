import { spawn } from "node:child_process";

const children = [];
let shuttingDown = false;

function startDev(appDir, name) {
  const child = spawn("npm", ["-C", appDir, "run", "dev"], {
    stdio: "inherit",
    detached: true,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    if (code === 0 || signal === "SIGTERM" || signal === "SIGINT") return;
    console.error(`${name} exited unexpectedly (code=${code}, signal=${signal ?? "none"}).`);
    shutdown(1);
  });

  children.push(child);
}

function killProcessGroup(child, signal) {
  if (!child.pid) return;
  try {
    process.kill(-child.pid, signal);
  } catch {
    // Ignore already-exited children.
  }
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    killProcessGroup(child, "SIGTERM");
  }

  setTimeout(() => {
    for (const child of children) {
      killProcessGroup(child, "SIGKILL");
    }
    process.exit(exitCode);
  }, 2000).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startDev("apps/web", "web");
startDev("apps/admin", "admin");
