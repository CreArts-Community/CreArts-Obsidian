// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ Snippets                                                                                ║
// ║ Version:                 ║ 1.0.0                                                                                   ║
// ║ Author:                  ║ AI, Corellan                                                                            ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

const fs = require('fs-extra');
const path = require('path');

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Snippets                 ║ Paths                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Define absolute paths referencing the local Obsidian vault structure
const VAULT_ROOT = path.resolve(__dirname, '../../../');
const SOURCE = path.join(VAULT_ROOT, 'themes', 'CreArts-Obsidian', 'snippets');
const TARGET = path.join(VAULT_ROOT, 'snippets');

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Snippets                 ║ Logic                                                                                   ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

// Function to copy the snippet files to the global Obsidian snippets folder
async function sync() {
  try {
    // Ensure the script is executed within an active .obsidian environment
    if (path.basename(VAULT_ROOT) !== '.obsidian' || !await fs.pathExists(SOURCE)) return;
    
    await fs.ensureDir(TARGET);
    
    // Copy all files, explicitly dereferencing any symlinks to enforce physical copies
    await fs.copy(SOURCE, TARGET, { overwrite: true, dereference: true });
    
    console.log('[COPY] 📦 Snippets physically updated.');
  } catch (err) {
    console.error('[COPY] Error:', err.message);
  }
}

// ╔══════════════════════════╦═════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ Snippets                 ║ Execution & Watch                                                                       ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

(async () => {
  // Execute an initial synchronization on startup
  await sync();
  
  // Keep running and watch for file modifications if the '--watch' argument is provided
  if (process.argv.includes('--watch')) {
    console.log('[WATCH] 👀 Watching snippets for changes...');
    
    let timeout;
    
    // Listen for file events and debounce the execution to prevent overlapping syncs
    fs.watch(SOURCE, { recursive: true }, (eventType, filename) => {
      if (filename) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          console.log(`[WATCH] 🔄 Change detected in: ${filename}`);
          sync();
        }, 100);
      }
    });
  }
})();
