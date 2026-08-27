// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Mobile                                                                                  ║
// ║ Version:                 ║ 1.0.0                                                                                   ║
// ║ Author:                  ║ AI, Corellan                                                                            ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require('fs-extra');
const path = require('path');

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Mobile                   ║ Paths                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Define absolute paths referencing the local Obsidian vault structure
const OBSIDIAN_ROOT = path.resolve(__dirname, '../../../'); // Points to .obsidian
const VAULT_ROOT = path.resolve(OBSIDIAN_ROOT, '../'); // Points to the Vault root

// Define source (CreArts-Obsidian theme root) and target (.mobile theme root)
const SOURCE = path.join(OBSIDIAN_ROOT, 'themes', 'CreArts-Obsidian');
const TARGET = path.join(VAULT_ROOT, '.mobile', 'themes', 'CreArts-Obsidian');

const FILES_TO_COPY = ['theme.css', 'manifest.json'];

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Mobile                   ║ Logic                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Function to copy theme.css and manifest.json to the .mobile themes folder
async function sync() {
  try {
    const mobileExists = await fs.pathExists(path.join(VAULT_ROOT, '.mobile'));
    if (!mobileExists || !await fs.pathExists(SOURCE)) return;

    await fs.ensureDir(TARGET);

    for (const file of FILES_TO_COPY) {
      const srcFile = path.join(SOURCE, file);
      const destFile = path.join(TARGET, file);

      if (await fs.pathExists(srcFile)) {
        await fs.copy(srcFile, destFile, { overwrite: true, dereference: true });
      }
    }

    console.log('[MOBILE] 📱 Theme files copied to .mobile folder.');
  } catch (err) {
    console.error('[MOBILE] Error:', err.message);
  }
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Mobile                   ║ Execution & Watch                                                                       ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

(async () => {
  // Execute an initial synchronization on startup
  await sync();

  // Keep running and watch for file modifications if the '--watch' argument is provided
  if (process.argv.includes('--watch')) {
    console.log('[MOBILE] 👀 Watching theme files for changes...');

    let timeout;

    // Listen for file events and debounce the execution to prevent overlapping syncs
    fs.watch(SOURCE, { recursive: false }, (eventType, filename) => {
      if (filename && FILES_TO_COPY.includes(filename)) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          console.log(`[MOBILE] 🔄 Change detected in: ${filename}`);
          sync();
        }, 100);
      }
    });
  }
})();
