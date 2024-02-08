const fs = require('fs-extra');
const jsonfile = require('jsonfile');

// Pfad zur manifest.json-Datei
const manifestJsonPath = 'manifest.json';

// Pfad zur package.json-Datei
const packageJsonPath = 'package.json';

// Pfad zur CSS-Datei, in der die Versionsnummer aktualisiert werden soll
const cssFilePath = 'src/css/info.css'; // Passe den Pfad entsprechend an

// Regex-Muster zum Aktualisieren der Versionsnummer in der CSS-Datei
const regex = /\/\* ║ Version:.*(\d+\.\d+\.\d+).* \*\//;

// Funktion zum Kopieren der Versionsnummer von manifest.json in package.json
function copyVersionToPackageJson() {
  const manifestJson = jsonfile.readFileSync(manifestJsonPath);
  const newVersion = manifestJson.version;

  const packageJson = jsonfile.readFileSync(packageJsonPath);
  packageJson.version = newVersion;

  jsonfile.writeFileSync(packageJsonPath, packageJson, { spaces: 2 });
}

// Funktion zum Aktualisieren der Versionsnummer in der CSS-Datei
function updateCssFileVersion(newVersion) {
  let cssContent = fs.readFileSync(cssFilePath, 'utf-8');
  
  // Verwende den Regex, um die alte Versionsnummer zu ersetzen
  cssContent = cssContent.replace(regex, `/* ║ Version:                 ║ ${newVersion}                                                                                   ║ */`);

  fs.writeFileSync(cssFilePath, cssContent);
}

// Kopiere die Versionsnummer von manifest.json in package.json
copyVersionToPackageJson();

// Aktualisiere die Versionsnummer in der CSS-Datei
updateCssFileVersion(jsonfile.readFileSync(packageJsonPath).version);

console.log('Version from manifest.json copied to package.json and updated in CSS file');
