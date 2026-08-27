// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Merge                                                                                   ║
// ║ Version:                 ║ 2.0.0                                                                                   ║
// ║ Author:                  ║ AI                                                                                      ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require("fs").promises;
const path = require("path");

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Merge                    ║ Paths                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Define the file paths to be merged in sequential order
const filePaths = [

  "merge/css/header-info.css",
//"merge/css/header-license.css",
  "merge/css/header-settings.css",
  "merge/txt/settings-top.txt",
  "merge/yaml/settings-info.yaml",
  "merge/yaml/settings-dark.yaml",
  "merge/yaml/dark.yaml",
  "merge/yaml/settings-light.yaml",
  "merge/yaml/light.yaml",
  "merge/yaml/settings-palette.yaml",
  "merge/yaml/settings-shape.yaml",
  "merge/yaml/settings-typography.yaml",
  "merge/yaml/settings-features.yaml",
  "merge/txt/settings-bottom.txt",
  "merge/css/header-skins.css",
  "merge/css/dark.css",
  "merge/css/light.css",
  "merge/css/header-code.css",
  "src/css/main.min.css",
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
// ║ Merge                    ║ Execution                                                                               ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Start the merging process
mergeAllFiles();
