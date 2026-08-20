// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Skins                                                                                   ║
// ║ Version:                 ║ 1.0.0                                                                                   ║
// ║ Author:                  ║ AI, Corellan                                                                            ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require("fs").promises;
const path = require("path");

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Skins                    ║ Paths                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Define the targeted skin variants and file extensions
const skinTypes = ['dark', 'light'];
const fileTypes = ['yaml', 'css'];

// Define the input and output folder paths for CSS and YAML processing
const inputCssFolderPath = 'skins';
const inputYamlFolderPath = 'skins';
const outputCssFolderPath = 'merge/css';
const outputYamlFolderPath = 'merge/yaml';

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Skins                    ║ Logic                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Function to merge skin files based on their specific type (CSS or YAML)
async function mergeSkinFiles(skinType, fileType, inputPath, outputPath) {
  try {
    // Construct the target folder path for the skin variation
    const folderPath = path.join(inputPath, skinType);

    // Read all files contained within the folder
    const files = await fs.readdir(folderPath);

    // Filter the file list based on the requested file extension
    const filteredFiles = files.filter(file => path.extname(file) === `.${fileType}`);

    // Separate the default file from the rest of the files for prioritization
    const defaultFile = filteredFiles.find(file => file === `default.${fileType}`);
    const otherFiles = filteredFiles.filter(file => file !== `default.${fileType}`);

    // Define the full path for the output file
    const outputFile = path.join(outputPath, `${skinType}.${fileType}`);

    // Array to hold the merged content
    const mergedContent = [];

    // Inject the default file content first, if it exists
    if (defaultFile) {
      const defaultContent = await fs.readFile(path.join(folderPath, defaultFile), 'utf-8');
      mergedContent.push(defaultContent);
    }

    // Append the content from all remaining files
    for (const file of otherFiles) {
      const content = await fs.readFile(path.join(folderPath, file), 'utf-8');
      mergedContent.push(content);
    }

    // Ensure the output directory exists, then write the final merged content
    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(outputFile, mergedContent.join('\n'), 'utf-8');

    console.log(`[SKINS] 🏷️  Files for "${skinType}" (${fileType}) successfully merged!`);
  } catch (err) {
    console.error(`[SKINS] 🏷️  Error while merging files for "${skinType}" (${fileType}):`, err);
  }
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Skins                    ║ Execution                                                                               ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Loop through each skin variant and file type to trigger the merge process
for (const skinType of skinTypes) {
  for (const fileType of fileTypes) {
    const inputPath = fileType === 'css' ? inputCssFolderPath : inputYamlFolderPath;
    const outputPath = fileType === 'css' ? outputCssFolderPath : outputYamlFolderPath;
    mergeSkinFiles(skinType, fileType, inputPath, outputPath);
  }
}
