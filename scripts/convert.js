// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Convert                                                                                                            ║
// ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require('fs');
const path = require('path');

// Directory where you have your SCSS files
const directory = './src/scss';

function convertCommentsInDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // If it's a directory, recursively call the function
      convertCommentsInDirectory(filePath);
    } else if (file.endsWith('.scss')) {
      // If it's an SCSS file, convert comments
      const content = fs.readFileSync(filePath, 'utf-8');
      const updatedContent = content.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g, (match) => {
        // Replace /* with //
        // Replace */ with nothing
        return match.replace(/\/\*/g, '//').replace(/\s*\*\//g, '');
      });

      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`Converted comments in ${filePath}`);
    }
  });
}

convertCommentsInDirectory(directory);
