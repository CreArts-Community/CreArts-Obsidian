// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ SVGO                                                                                    ║
// ║ Version:                 ║ 1.0.0                                                                                   ║
// ║ Author:                  ║ AI, Corellan                                                                            ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require("fs-extra");
const path = require("path");
const { optimize } = require("svgo");
const svgToMiniDataURI = require("mini-svg-data-uri");
const { config } = require("./svgo.config.js");

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ SVGO                     ║ Core Logic                                                                              ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const uriPattern = /"(data:image\/svg\+xml,[^"]+)"/g;

function processScssFile(filePath, write) {
  const content = fs.readFileSync(filePath, "utf-8");

  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  const updated = content.replace(uriPattern, (match, uri) => {
    count++;
    const before = Buffer.byteLength(uri, "utf-8");

    const svg = decodeURIComponent(uri.replace(/^data:image\/svg\+xml,/, ""));
    const result = optimize(svg, config);
    const newUri = svgToMiniDataURI(result.data);

    const after = Buffer.byteLength(newUri, "utf-8");
    totalBefore += before;
    totalAfter += after;

    console.log(`    [${count}] ${before}B -> ${after}B (${Math.round((1 - after / before) * 100)}% weniger)`);

    return `"${newUri}"`;
  });

  if (count === 0) return null;

  const savedPct = Math.round((1 - totalAfter / totalBefore) * 100);
  console.log(`  ${count} Icon(s), gesamt ${totalBefore}B -> ${totalAfter}B (${savedPct}% weniger)`);

  if (write) {
    fs.copyFileSync(filePath, `${filePath}.bak`);
    fs.writeFileSync(filePath, updated);
    console.log(`  -> geschrieben (Backup: ${path.basename(filePath)}.bak)`);
  } else {
    console.log("  -> Dry-run, nichts geschrieben (--write zum Uebernehmen)");
  }

  return { count, totalBefore, totalAfter };
}

function collectScssFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target)
    .filter((f) => f.endsWith(".scss"))
    .map((f) => path.join(target, f));
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ SVGO                     ║ Execution                                                                               ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const args = process.argv.slice(2);
const write = args.includes("--write");
const target = args.find((a) => !a.startsWith("--")) || "src/scss/icons";

const files = collectScssFiles(target);
let grandBefore = 0;
let grandAfter = 0;
let grandCount = 0;

for (const file of files) {
  console.log(`\n${file}`);
  const result = processScssFile(file, write);
  if (result) {
    grandBefore += result.totalBefore;
    grandAfter += result.totalAfter;
    grandCount += result.count;
  }
}

if (grandCount > 0) {
  console.log(
    `\n[SVGO] 🚀 Gesamt: ${grandCount} Icon(s) in ${files.length} Datei(en), ${grandBefore}B -> ${grandAfter}B (${Math.round(
      (1 - grandAfter / grandBefore) * 100,
    )}% weniger)`,
  );
} else {
  console.log("\n[SVGO] Keine passenden Icons gefunden.");
}
