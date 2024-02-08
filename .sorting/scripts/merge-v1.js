const mergeFiles = require("merge-files");
const fs = require("fs").promises;
const path = require("path");

// Array of file paths you want to merge
const filePaths = [
  "src/css/info.css",
  "src/css/license.css",
  "src/css/commands.css",
  "src/css/settings.css",
  "src/txt/settings-top.txt",
  "settings.yaml",
  "src/txt/settings-bottom.txt",
  "src/css/code.css",
  "src/css/main.css"
];

// File path where the merged file should be created.
const outputPath = "theme.css";

// Cache path where the cached file should be created.
const cachePath = ".cache/theme.cache";

// Main function to perform file merging
async function mergeAllFiles() {
  try {
    // Check if the merged file is in the cache
    const isCached = await fileExists(cachePath);

    if (!isCached) {
      // Merge the files
      await mergeFiles(filePaths, outputPath);

      // Save the merged file to the cache
      await fs.copyFile(outputPath, cachePath);
    } else {
      // Check timestamps of source files and cache file
      const [cacheStat, ...sourceStats] = await Promise.all([
        fs.stat(cachePath),
        ...filePaths.map(filePath => fs.stat(filePath))
      ]);

      const sourceChanged = sourceStats.some((sourceStat) =>
        sourceStat.mtime > cacheStat.mtime
      );

      if (sourceChanged) {
        // Merge the files if any source file has changed
        await mergeFiles(filePaths, outputPath);
        // Update the cache with the new merged file
        await fs.copyFile(outputPath, cachePath);
      }
    }

    console.log("Files successfully merged!");
  } catch (err) {
    console.error("Error while merging files:", err);
  }
}

// Function to check if a file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

// Start the merging process
mergeAllFiles();
