// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Skins                                                                                                              ║
// ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require("fs").promises;
const path = require("path");

// Define the skin types and file types
const skinTypes = ['dark', 'light'];
const fileTypes = ['yaml', 'css'];

// Define the input and output folder paths for CSS and YAML separately
const inputCssFolderPath = 'skins';
const inputYamlFolderPath = 'skins';
const outputCssFolderPath = 'merge/css';
const outputYamlFolderPath = 'merge/yaml';

// Function to merge skin files of a specific type
async function mergeSkinFiles(skinType, fileType, inputPath, outputPath) {
  try {
    // Define the folder path for the skin and fileType
    const folderPath = path.join(inputPath, skinType);

    // Read all files in the folder
    const files = await fs.readdir(folderPath);

    // Filter files based on the file type
    const filteredFiles = files.filter(file => path.extname(file) === `.${fileType}`);

    // Separate default files and others
    const defaultFile = filteredFiles.find(file => file === `default.${fileType}`);
    const otherFiles = filteredFiles.filter(file => file !== `default.${fileType}`);

    // Define the output file path
    const outputFile = path.join(outputPath, `${skinType}.${fileType}`);

    // Merge the files, with default files first
    const mergedContent = [];

    // Add default file first if it exists
    if (defaultFile) {
      const defaultContent = await fs.readFile(path.join(folderPath, defaultFile), 'utf-8');
      mergedContent.push(defaultContent);
    }

    // Add the other files
    for (const file of otherFiles) {
      const content = await fs.readFile(path.join(folderPath, file), 'utf-8');
      mergedContent.push(content);
    }

    // Write the merged content to the output file
    await fs.mkdir(outputPath, { recursive: true }); // Create output folder if it doesn't exist
    await fs.writeFile(outputFile, mergedContent.join('\n'), 'utf-8');

    console.log(`Files for "${skinType}" (${fileType}) successfully merged!`);
  } catch (err) {
    console.error(`Error while merging files for "${skinType}" (${fileType}):`, err);
  }
}

// Loop through skin types and file types and merge the files
for (const skinType of skinTypes) {
  for (const fileType of fileTypes) {
    const inputPath = fileType === 'css' ? inputCssFolderPath : inputYamlFolderPath;
    const outputPath = fileType === 'css' ? outputCssFolderPath : outputYamlFolderPath;
    mergeSkinFiles(skinType, fileType, inputPath, outputPath);
  }
}
