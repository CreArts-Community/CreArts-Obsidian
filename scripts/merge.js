// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Merge                                                                                   ║
// ║ Version:                 ║ 2.2.0                                                                                   ║
// ║ Author:                  ║ AI                                                                                      ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Merge                    ║ Flags                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// --watch  : keeps the process running and re-merges on any relevant file change
// --dev    : uses the expanded dev CSS instead of the minified production CSS
//            (implied automatically when --watch is used)
const isWatch = process.argv.includes("--watch");
const isDev = process.argv.includes("--dev") || isWatch;

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Merge                    ║ Paths                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Source CSS produced by sass, switches depending on --dev/--watch
const devSource = "src/css/main.css";
const prodSource = "src/css/main.min.css";

// Define the file paths to be merged in sequential order
const filePaths = [

  "merge/css/header-info.css",
//"merge/css/header-license.css",
  "merge/css/header-settings.css",
  "merge/txt/settings-top.txt",
  "merge/yaml/settings-info.yaml",
  "merge/yaml/settings-dark.yaml",
  "merge/yaml/skins-dark.yaml",
  "merge/yaml/settings-light.yaml",
  "merge/yaml/skins-light.yaml",
  "merge/yaml/settings-palette.yaml",
  "merge/yaml/settings-shape.yaml",
  "merge/yaml/settings-typography.yaml",
  "merge/yaml/settings-features.yaml",
  "merge/txt/settings-bottom.txt",
  "merge/css/header-skins.css",
  "merge/css/skins-dark.css",
  "merge/css/skins-light.css",
  "merge/css/header-code.css",
  isDev ? devSource : prodSource,
];

// Define the output path for the final merged file
const outputPath = "theme.css";

// Define the cache path and directory where the cached file should be stored
const cacheFolderPath = ".cache";
const cacheFilePath = `${cacheFolderPath}/theme.cache`;

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Merge                    ║ Cache Handling                                                                          ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Function to ensure the cache folder structure exists
async function ensureCacheFolderExists() {
  try {
    await fs.mkdir(path.dirname(cacheFilePath), { recursive: true });
  } catch (err) {
    console.error("[MERGE] Error while creating cache folder:", err);
  }
}

// Function to check if a specific file exists on the disk
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Merge                    ║ Core Logic                                                                              ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Native function to read, clean BOM (U+FEFF), and merge files sequentially
async function mergeFilesClean(inputPaths, destination) {
  const contents = await Promise.all(
    inputPaths.map(async (filePath) => {
      let content = await fs.readFile(filePath, "utf8");
      // Strips any potential Byte Order Mark (U+FEFF) from the start of each file
      return content.replace(/^\uFEFF/, "");
    })
  );

  // Join all file contents cleanly separated by a newline
  await fs.writeFile(destination, contents.join("\n"), "utf8");
}

// Main function to execute the file merging process
async function mergeAllFiles() {
  try {
    // Ensure the cache directory is available
    await ensureCacheFolderExists();

    // In watch mode we always want an immediate, unconditional merge on every
    // trigger, so we skip the cache short-circuit entirely in that case.
    if (isWatch) {
      await mergeFilesClean(filePaths, outputPath);
      await fs.copyFile(outputPath, cacheFilePath);
      console.log(`[MERGE] 💡 Files successfully merged! (${isDev ? "dev" : "prod"})`);
      return;
    }

    // Verify if the merged file is already cached
    const isCached = await fileExists(cacheFilePath);

    if (!isCached) {
      // Merge all source files directly if no cache exists
      await mergeFilesClean(filePaths, outputPath);

      // Store a copy of the newly merged file in the cache directory
      await fs.copyFile(outputPath, cacheFilePath);
    } else {
      // Retrieve modification timestamps of both the cache file and all source files
      const [cacheStat, ...sourceStats] = await Promise.all([
        fs.stat(cacheFilePath),
        ...filePaths.map(filePath => fs.stat(filePath))
      ]);

      // Check if any source file is newer than the cached file
      const sourceChanged = sourceStats.some((sourceStat) =>
        sourceStat.mtime > cacheStat.mtime
      );

      if (sourceChanged) {
        // Re-merge the files because at least one source file was modified
        await mergeFilesClean(filePaths, outputPath);

        // Update the cache file with the newly generated output
        await fs.copyFile(outputPath, cacheFilePath);
      }
    }

    console.log("[MERGE] 💡 Files successfully merged!");
  } catch (err) {
    console.error("[MERGE] 💡 Error while merging files:", err);
  }
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Merge                    ║ Watch Mode                                                                              ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Debounce helper: fs.watch can fire multiple events for a single logical save
// (some editors/OSes write in several steps), so we collapse bursts of events
// into a single merge call instead of re-merging many times per keystroke.
function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function startWatchMode() {
  console.log("[MERGE] 👀 Watch mode started, using", isDev ? devSource : prodSource);

  const debouncedMerge = debounce(() => {
    mergeAllFiles();
  }, 100);

  // Run once immediately so theme.css is up to date as soon as the watcher starts
  mergeAllFiles();

  // Watch the entire merge/ folder (css, txt, yaml headers/snippets for Style Settings)
  const mergeDir = "merge";
  if (fsSync.existsSync(mergeDir)) {
    fsSync.watch(mergeDir, { recursive: true }, (eventType, filename) => {
      if (filename) {
        console.log(`[MERGE] 🔄 Change detected in merge/${filename}`);
      }
      debouncedMerge();
    });
  } else {
    console.warn(`[MERGE] ⚠️  Folder "${mergeDir}" not found, skipping watch on it.`);
  }

  // Watch the dev CSS file produced by "sass --watch" so merges happen right
  // after every SCSS recompile as well, not just on merge/ changes.
  const cssTarget = isDev ? devSource : prodSource;
  const cssDir = path.dirname(cssTarget);
  const cssFile = path.basename(cssTarget);

  if (fsSync.existsSync(cssDir)) {
    fsSync.watch(cssDir, (eventType, filename) => {
      if (filename === cssFile) {
        debouncedMerge();
      }
    });
  } else {
    console.warn(`[MERGE] ⚠️  Folder "${cssDir}" not found, skipping watch on it.`);
  }
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Merge                    ║ Execution                                                                               ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

if (isWatch) {
  startWatchMode();
} else {
  mergeAllFiles();
}
