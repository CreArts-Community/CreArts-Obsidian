const fs = require('fs-extra');
const jsonfile = require('jsonfile');

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Versions                 ║ Paths                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Paths to the files
const manifestJsonPath = 'manifest.json';
const packageJsonPath = 'package.json';
const cssInfoFilePath = 'merge/css/header-info.css';
const cssVariablesFilePath = 'src/scss/variables/_general.scss';

// Path to the cache folder and cache file
const cacheFolderPath = '.cache';
const cacheFilePath = `${cacheFolderPath}/version.cache`;

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Versions                 ║ Copy Version                                                                            ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Function to copy the version from manifest.json to package.json
function copyVersionToPackageJson() {
  const manifestJson = jsonfile.readFileSync(manifestJsonPath);
  const newVersion = manifestJson.version;

  const packageJson = jsonfile.readFileSync(packageJsonPath);
  packageJson.version = newVersion;

  jsonfile.writeFileSync(packageJsonPath, packageJson, { spaces: 2 });
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Versions                 ║ Info                                                                                    ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

//Regular expression to update the version number in the CSS file.
const regexInfo = /\/\* ║ Version:.*(\d+\.\d+\.\d+).* \*\//;

// Function to update the version number in the CSS file
function updateCssInfoFileVersion(newVersion) {
  let cssInfoContent = fs.readFileSync(cssInfoFilePath, 'utf-8');
  
  // Use the regex to replace the old version number
  cssInfoContent = cssInfoContent.replace(regexInfo, `/* ║ Version:                 ║ ${newVersion}                                                                                   ║ */`);

  fs.writeFileSync(cssInfoFilePath, cssInfoContent);
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Versions                 ║ Variables                                                                               ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

//Regular expression to update the version number in the CSS file.
const regexVariables = /--CREARTS-info-version:\s*"v?([^"]*)"/;

// Function to update the version number in the CSS file
function updateCssVariablesFileVersion(newVersion) {
  let cssVariablesContent = fs.readFileSync(cssVariablesFilePath, 'utf-8');
  
  // Use the regex to replace the old version number
  cssVariablesContent = cssVariablesContent.replace(regexVariables, `--CREARTS-info-version: "v${newVersion}"`);

  fs.writeFileSync(cssVariablesFilePath, cssVariablesContent);
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Versions                 ║ Cache                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Function to get the version from the cache
function getVersionFromCache() {
  try {
    return fs.readFileSync(cacheFilePath, 'utf-8').trim();
  } catch (err) {
    // If the cache file doesn't exist or an error occurs, return an empty string
    return '';
  }
}

// Function to save the version to the cache
function saveVersionToCache(version) {
  fs.ensureDirSync(cacheFolderPath); // Ensure cache folder exists
  fs.writeFileSync(cacheFilePath, version);
}

// Get the current version from manifest.json
const currentVersion = jsonfile.readFileSync(manifestJsonPath).version;

// Get the cached version from the cache file
const cachedVersion = getVersionFromCache();

// Compare the current version with the cached version
if (currentVersion !== cachedVersion) {
  // If they don't match, update package.json, the CSS file, and the cache
  copyVersionToPackageJson();
  updateCssInfoFileVersion(currentVersion);
  updateCssVariablesFileVersion(currentVersion);
  saveVersionToCache(currentVersion);
  console.log('Version updated in package.json and CSS file');
} else {
  // If they match, print a message indicating no change
  console.log('No change in version, script not executed');
}
