// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Distribute Snippets                                                                     ║
// ║ Version:                 ║ 2.1.0                                                                                   ║
// ║ Author:                  ║ AI                                                                                      ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require('fs-extra');
const path = require('path');

// Config laden
let config = { snippetTargets: [] };
try {
  const localConfig = require('./distribute-paths.local.json');
  config = { ...config, ...localConfig };
} catch (e) {
  try {
    const standardConfig = require('./distribute-paths.json');
    config = { ...config, ...standardConfig };
  } catch (err) {
    console.error('[DISTRIBUTE-SNIPPETS] Fehler: Keine Konfigurationsdatei gefunden.');
  }
}

const SOURCE = path.join(__dirname, '..', 'snippets');

async function distribute() {
  try {
    if (!await fs.pathExists(SOURCE)) return;

    for (const targetPath of config.snippetTargets) {
      const absoluteTarget = path.resolve(__dirname, '..', targetPath);
      await fs.ensureDir(absoluteTarget);
      
      await fs.copy(SOURCE, absoluteTarget, { overwrite: true, dereference: true });
    }
    
    console.log(`[DISTRIBUTE-SNIPPETS] 📦 Snippets an ${config.snippetTargets.length} Ziele verteilt.`);
  } catch (err) {
    console.error('[DISTRIBUTE-SNIPPETS] Error:', err.message);
  }
}

(async () => {
  await distribute();

  if (process.argv.includes('--watch')) {
    console.log('[WATCH-SNIPPETS] 👀 Beobachte Snippets...');
    let timeout;
    fs.watch(SOURCE, { recursive: true }, (eventType, filename) => {
      if (filename) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          console.log(`[WATCH-SNIPPETS] 🔄 Änderung in Snippets: ${filename}`);
          distribute();
        }, 100);
      }
    });
  }
})();
