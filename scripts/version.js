// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Version                                                                                 ║
// ║ Version:                 ║ 1.0.0                                                                                   ║
// ║ Author:                  ║ AI                                                                                      ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require('fs-extra');

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Version                  ║ Paths                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Define paths to the required project files
const manifestJsonPath = 'manifest.json';
const packageJsonPath = 'package.json';
const cssInfoFilePath = 'merge/css/header-info.css';
const cssVariablesFilePath = 'src/scss/variables/_general.scss';

// Define the cache directory and cache file path
const cacheFolderPath = '.cache';
const cacheFilePath = `${cacheFolderPath}/version.cache`;

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Version                  ║ Logic                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Function to extract the current version from manifest.json and apply it to package.json
function copyVersionToPackageJson() {
  const manifestJson = fs.readJsonSync(manifestJsonPath);
  const newVersion = manifestJson.version;

  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.version = newVersion;

  // Write back to package.json with 2 spaces for indentation
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
}

// Regular expression to locate and update the version string within the CSS header info file
const regexInfo = /\/\* ║ Version:.*(\d+\.\d+\.\d+).* \*\//;

function updateCssInfoFileVersion(newVersion) {
  let cssInfoContent = fs.readFileSync(cssInfoFilePath, 'utf-8');
  
  // Replace the matched line with the freshly updated version number
  cssInfoContent = cssInfoContent.replace(
    regexInfo,
    `/* ║ Version:                 ║ ${newVersion}                                                                                   ║ */`
  );
  
  fs.writeFileSync(cssInfoFilePath, cssInfoContent);
}

// Regular expression to locate and update the SCSS version variable
const regexVariables = /--CREARTS-info-theme-version:\s*"v?([^"]*)"/;

function updateCssVariablesFileVersion(newVersion) {
  let cssVariablesContent = fs.readFileSync(cssVariablesFilePath, 'utf-8');
  
  // Replace the matched variable definition with the new version number
  cssVariablesContent = cssVariablesContent.replace(
    regexVariables,
    `--CREARTS-info-theme-version: "v${newVersion}"`
  );
  
  fs.writeFileSync(cssVariablesFilePath, cssVariablesContent);
}

// Function to read the previously cached version string
function getVersionFromCache() {
  try {
    return fs.readFileSync(cacheFilePath, 'utf-8').trim();
  } catch (err) {
    // Return an empty string if the cache file does not exist yet
    return '';
  }
}

// Function to write the newly processed version string into the cache file
function saveVersionToCache(version) {
  fs.ensureDirSync(cacheFolderPath);
  fs.writeFileSync(cacheFilePath, version);
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Version                  ║ Execution                                                                               ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Read the current source of truth for the version (manifest.json)
const currentVersion = fs.readJsonSync(manifestJsonPath).version;

// Retrieve the last processed version from the cache
const cachedVersion = getVersionFromCache();

// Compare and execute updates only if the version has changed
if (currentVersion !== cachedVersion) {
  copyVersionToPackageJson();
  updateCssInfoFileVersion(currentVersion);
  updateCssVariablesFileVersion(currentVersion);
  saveVersionToCache(currentVersion);
  
  console.log('[VERSION] 🚀 Version updated in package.json and CSS file.');
} else {
  console.log('[VERSION] 🚀 No change in version, script not executed.');
}
