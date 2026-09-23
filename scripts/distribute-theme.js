// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Distribute Theme                                                                        ║
// ║ Version:                 ║ 2.1.0                                                                                   ║
// ║ Author:                  ║ AI                                                                                      ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require('fs-extra');
const path = require('path');

// Config laden
let config = { themeTargets: [] };
try {
  const localConfig = require('./distribute-paths.local.json');
  config = { ...config, ...localConfig };
} catch (e) {
  try {
    const standardConfig = require('./distribute-paths.json');
    config = { ...config, ...standardConfig };
  } catch (err) {
    console.error('[DISTRIBUTE-THEME] Fehler: Keine Konfigurationsdatei gefunden.');
  }
}

const SOURCE = path.resolve(__dirname, '..');
const FILES_TO_COPY = ['theme.css', 'manifest.json'];

async function distribute() {
  try {
    for (const targetPath of config.themeTargets) {
      const absoluteTarget = path.resolve(__dirname, '..', targetPath);
      await fs.ensureDir(absoluteTarget);

      for (const file of FILES_TO_COPY) {
        const srcFile = path.join(SOURCE, file);
        const destFile = path.join(absoluteTarget, file);

        if (await fs.pathExists(srcFile)) {
          await fs.copy(srcFile, destFile, { overwrite: true });
        }
      }
    }
    console.log(`[DISTRIBUTE-THEME] 🚀 Theme an ${config.themeTargets.length} Ziele verteilt.`);
  } catch (err) {
    console.error('[DISTRIBUTE-THEME] Error:', err.message);
  }
}

(async () => {
  await distribute();

  if (process.argv.includes('--watch')) {
    console.log('[WATCH-THEME] 👀 Beobachte Theme-Dateien...');
    let timeout;
    fs.watch(SOURCE, { recursive: false }, (eventType, filename) => {
      if (filename && FILES_TO_COPY.includes(filename)) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          console.log(`[WATCH-THEME] 🔄 Änderung: ${filename}`);
          distribute();
        }, 100);
      }
    });
  }
})();
