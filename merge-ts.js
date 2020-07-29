const fs = require("fs");
const path = require("path");
const walk = require("klaw-sync");

const dir = path.resolve(__dirname, "dist");

const contents = [];
walk(dir)
  .filter((p) => /\.d\.ts$/.test(p.path))
  .map((p) => p.path)
  .forEach((path) => {
    const cont = fs.readFileSync(path, { encoding: "utf8" });
    contents.push(cont);
    fs.unlinkSync(path);
  });

const file = fs.openSync(path.resolve(dir, "QuickFetch.d.ts"), "w");
fs.writeFileSync(file, contents.join(), {
  encoding: "utf8",
});
fs.closeSync(file);
