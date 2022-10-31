#!/usr/bin/env node

import esbuild from "esbuild";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import Path from "path";
import glob from "glob";
import fs from "fs";

const ROOT = "widget-src";
const EMBEDDED_ROOT = `${ROOT}/embedded_ui`;

async function globPromise(globStr) {
  return new Promise((resolve, reject) => {
    glob(globStr, (err, matches) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(matches);
    });
  });
}

// Build the embedded_ui ts files first.
const embeddedTsFiles = await globPromise(`${EMBEDDED_ROOT}/**/index.ts`);
esbuild.buildSync({
  logLevel: "info",
  entryPoints: embeddedTsFiles,
  outdir: `${EMBEDDED_ROOT}/dist`,
  bundle: true,
  target: "es6",
});

// Embed the generated javascript into HTML.
const embeddedHtmlFiles = await globPromise(`${EMBEDDED_ROOT}/**/index.html`);
for (const htmlFile of embeddedHtmlFiles) {
  const htmlDirname = Path.parse(Path.dirname(htmlFile)); // widget-src/embedded_ui/edit_panel -> // widget-src/embedded_ui/dist/edit_panel
  const jsPath = `${htmlDirname.dir}/dist/${htmlDirname.name}/index.js`;
  const jsData = fs.readFileSync(jsPath).toString();
  const htmlData = fs.readFileSync(htmlFile).toString();

  const outputHtmlString = `
        export default \`
            ${htmlData}
            <script>
                ${jsData}
            </script>
        \`
    `;

  fs.writeFileSync(`${Path.dirname(jsPath)}/index.html.ts`, outputHtmlString);
}

// Finally build the widget itself.
esbuild.buildSync({
  logLevel: "info",
  entryPoints: ["widget-src/code.tsx"],
  bundle: true,
  target: "es6",
  outdir: "dist",
});
