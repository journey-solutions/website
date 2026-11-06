// Builds ../index.html (or test/index.html with --test, using the mock Firebase in mock/).
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const test = process.argv.includes("--test");
const alias = test ? {
  "firebase/app": path.join(here, "mock/app.js"),
  "firebase/auth": path.join(here, "mock/auth.js"),
  "firebase/firestore": path.join(here, "mock/firestore.js"),
} : {};

const out = await build({
  entryPoints: [path.join(here, "src/app.js")],
  bundle: true, format: "esm", minify: !test, write: false, target: "es2020", alias, legalComments: "none",
});
const js = out.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = readFileSync(path.join(here, "src/template.html"), "utf8").replace("/*__APP__*/", () => js);
const dest = test ? path.join(here, "test/index.html") : path.join(here, "../index.html");
mkdirSync(path.dirname(dest), { recursive: true });
writeFileSync(dest, html);
console.log("wrote", path.relative(process.cwd(), dest), (html.length / 1024).toFixed(0) + " KB");
