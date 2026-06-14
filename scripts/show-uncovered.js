const cov = require("../coverage/coverage-final.json");
const base = process.cwd().replaceAll("\\", "/");
for (const [path, data] of Object.entries(cov)) {
  const rel = path.replaceAll("\\", "/").replace(base + "/", "");
  const uncovStmt = Object.entries(data.s).filter(([, v]) => v === 0);
  const uncovBr = Object.entries(data.b).filter(([, v]) => v.includes(0));
  const uncovFn = Object.entries(data.f).filter(([, v]) => v === 0);
  if (uncovStmt.length || uncovBr.length || uncovFn.length) {
    const lines = uncovStmt
      .map(([k]) => data.statementMap[k]?.start?.line)
      .filter(Boolean);
    const brLines = uncovBr.flatMap(([k, v]) => {
      const loc = data.branchMap[k]?.locations || [];
      return loc
        .filter((_, i) => v[i] === 0)
        .map((l) => l?.start?.line)
        .filter(Boolean);
    });
    const allLines = [...new Set([...lines, ...brLines])].sort((a, b) => a - b);
    const fns = uncovFn.map(([k]) => data.fnMap[k]?.name || k);
    // eslint-disable-next-line no-console
    console.log(
      rel +
        "  lines:" +
        allLines.join(",") +
        (fns.length ? "  fns:" + fns.join(",") : ""),
    );
  }
}
