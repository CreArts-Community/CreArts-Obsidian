// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Skins                                                                                   ║
// ║ Version:                 ║ 2.2.1                                                                                   ║
// ║ Author:                  ║ AI                                                                                      ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Config                   ║ Paths                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const skinTypes = ['dark', 'light'];
const inputBaseFolder = 'skins';
const outputCssFolderPath = 'merge/css';
const outputYamlFolderPath = 'merge/yaml';
const outputSnippetFolderPath = 'snippets';

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Helpers                  ║ JSON to CSS & Minify                                                                    ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

function jsonToCssVars(obj, prefix = '--SKIN') {
  let vars = [];
  for (const [key, value] of Object.entries(obj)) {
    const varName = `${prefix}-${key}`;
    if (typeof value === 'object' && value !== null) {
      vars = vars.concat(jsonToCssVars(value, varName));
    } else {
      let cleanValue;
      if (prefix.includes('info')) {
        cleanValue = typeof value === 'string' ? `"${value.replace(/^["'](.*)["']$/, '$1')}"` : value;
      } else {
        cleanValue = typeof value === 'string' ? value.replace(/^["'](.*)["']$/, '$1') : value;
      }
      vars.push(`${varName}:${cleanValue};`);
    }
  }
  return vars;
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Core Logic               ║ Processing                                                                              ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

async function processSkins() {
  try {
    for (const skinType of skinTypes) {
      const folderPath = path.join(inputBaseFolder, skinType);
      
      try {
        await fs.access(folderPath);
      } catch {
        console.warn(`[SKINS] ⚠️ Folder "${folderPath}" not found.`);
        continue;
      }

      const files = await fs.readdir(folderPath);
      const jsonFiles = files.filter(f => path.extname(f) === '.json');

      jsonFiles.sort((a, b) => (a === 'default.json' ? -1 : b === 'default.json' ? 1 : a.localeCompare(b)));

      const mergedMinifiedCss = [];
      const yamlOptions = [];

      for (const file of jsonFiles) {
        const fileContent = await fs.readFile(path.join(folderPath, file), 'utf-8');
        const json = JSON.parse(fileContent);
        
        const fileSlug = path.basename(file, '.json');
        const displayName = json.info?.name || (fileSlug.charAt(0).toUpperCase() + fileSlug.slice(1));
        const skinClass = `skin-${skinType}-${fileSlug}`;
        const snippetFileName = `crearts-${skinClass}.css`;

        yamlOptions.push(
          `            -\n` +
          `                label: ${displayName}\n` +
          `                value: ${skinClass}`
        );

        const cssVars = jsonToCssVars(json);
        const minified = `.theme-${skinType}.${skinClass}{${cssVars.join('')}}`;
        mergedMinifiedCss.push(minified);

        // Fügt bei allen Variablen (inklusive Info) ein !important hinzu
        const formattedVars = cssVars.map(v => `  ${v.replace(';', ' !important;')}`).join('\n');

        const snippetContent = `/* Skin: ${displayName} (${skinType}) */\n.theme-${skinType} {\n${formattedVars}\n}`;
        
        await fs.mkdir(outputSnippetFolderPath, { recursive: true });
        await fs.writeFile(
          path.join(outputSnippetFolderPath, snippetFileName),
          snippetContent,
          'utf-8'
        );
      }

      await fs.mkdir(outputCssFolderPath, { recursive: true });
      await fs.mkdir(outputYamlFolderPath, { recursive: true });

      await fs.writeFile(path.join(outputCssFolderPath, `skins-${skinType}.css`), mergedMinifiedCss.join('\n'), 'utf-8');
      await fs.writeFile(path.join(outputYamlFolderPath, `skins-${skinType}.yaml`), yamlOptions.join('\n'), 'utf-8');

      console.log(`[SKINS] 🏷️  ${skinType.toUpperCase()} Skins (${jsonFiles.length} JSONs) processed!`);
    }
  } catch (err) {
    console.error("[SKINS] 🏷️  Error processing skins:", err);
  }
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

(async () => {
  await processSkins();

  if (process.argv.includes('--watch')) {
    console.log('[WATCH] 👀 Watching skins for changes...');

    const debouncedProcess = debounce(() => {
      processSkins();
    }, 100);

    if (fsSync.existsSync(inputBaseFolder)) {
      fsSync.watch(inputBaseFolder, { recursive: true }, (eventType, filename) => {
        if (filename) {
          console.log(`[WATCH] 🔄 Change detected in skin file: ${filename}`);
          debouncedProcess();
        }
      });
    } else {
      console.warn(`[WATCH] ⚠️  Folder "${inputBaseFolder}" not found, skipping watch.`);
    }
  }
})();
