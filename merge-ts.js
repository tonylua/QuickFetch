const fs = require("fs");
const path = require("path");
const walk = require("klaw-sync");

// TODO
const _clear = (cont) => cont.replace(/import\s.*?\sfrom\s".*?";/g, "");

const dir = path.resolve(__dirname, "dist");

const baseCont = fs.readFileSync(
  path.resolve(__dirname, "src/quickfetch.d.ts"),
  { encoding: "utf8" }
);

const contents = [];
walk(dir)
  .filter((p) => /\.d\.ts$/.test(p.path))
  .map((p) => p.path)
  .forEach((path) => {
    const cont = fs.readFileSync(path, { encoding: "utf8" });
    contents.push(_clear(cont));
    fs.unlinkSync(path);
  });

const file = fs.openSync(path.resolve(dir, "QuickFetch.d.ts"), "w");
fs.writeFileSync(file, [baseCont, ...contents].join(), {
  encoding: "utf8",
});
fs.closeSync(file);
