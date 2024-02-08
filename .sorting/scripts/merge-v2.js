const mergeFiles = require("merge-files");
const fs = require("fs").promises;
const path = require("path");

// Define the file paths to be merged
const filePaths = [
  "src/css/info.css",
  "src/css/license.css",
  "src/css/commands.css",
  "src/css/settings.css",

  "src/txt/settings-top.txt",
  "src/yaml/info.yaml",
  "src/yaml/skins-dark.yaml",
  "skins/dark/*.yaml",
  "src/yaml/skins-light.yaml",
  "skins/light/*.yaml",
  "src/txt/settings-bottom.txt",

  "src/css/skins.css",
  "skins/*.css",
  "src/css/code.css",
  "src/css/main.css"
];

// Define the output path for the merged file
const outputPath = "theme.css";

// Define the cache path and folder where the cached file should be stored
const cacheFolderPath = ".cache";
const cacheFilePath = `${cacheFolderPath}/theme.cache`;

// Function to ensure the cache folder exists
async function ensureCacheFolderExists() {
  try {
    await fs.mkdir(path.dirname(cacheFilePath), { recursive: true });
  } catch (err) {
    console.error("Error while creating cache folder:", err);
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

// Main function to perform file merging
async function mergeAllFiles() {
  try {
    // Ensure the cache folder exists
    await ensureCacheFolderExists();

    // Check if the merged file is cached
    const isCached = await fileExists(cacheFilePath);

    if (!isCached) {
      // Merge the files if not cached
      await mergeFiles(filePaths, outputPath);

      // Save the merged file to the cache
      await fs.copyFile(outputPath, cacheFilePath);
    } else {
      // Check timestamps of source files and cache file
      const [cacheStat, ...sourceStats] = await Promise.all([
        fs.stat(cacheFilePath),
        ...filePaths.map(filePath => fs.stat(filePath))
      ]);

      const sourceChanged = sourceStats.some((sourceStat) =>
        sourceStat.mtime > cacheStat.mtime
      );

      if (sourceChanged) {
        // Merge the files if any source file has changed
        await mergeFiles(filePaths, outputPath);

        // Update the cache with the new merged file
        await fs.copyFile(outputPath, cacheFilePath);
      }
    }

    console.log("Files successfully merged!");
  } catch (err) {
    console.error("Error while merging files:", err);
  }
}

// Start the merging process
mergeAllFiles();
