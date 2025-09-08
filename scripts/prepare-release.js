import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = require('../package.json');
const version = pkg.version;
const releaseDir = path.join(__dirname, 'releases');

// Ensure we have the release files
const requiredFiles = [
  `KnoksPix Setup ${version}.exe`,
  `KnoksPix Setup ${version}.exe.blockmap`,
  'latest.yml'
];

console.log('Checking release files...');
requiredFiles.forEach(file => {
  const filePath = path.join(releaseDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${file}`);
    process.exit(1);
  }
  console.log(`✓ Found ${file}`);
});

// Generate release notes
const changes = [
  '### New Features',
  '- Image editing and enhancement with AI capabilities',
  '- Cross-platform support (Windows & Android)',
  '- Auto-update system for Windows',
  '',
  '### Technical Updates',
  '- Optimized build system',
  '- Improved performance',
  '- Enhanced stability',
  '',
  '### Installation',
  '- Windows: Run the installer and follow the prompts',
  '- Android: Install the APK from Google Play Store or direct download',
  '',
  '### Requirements',
  '- Windows 10/11 64-bit',
  '- Android 8.0 or later'
].join('\n');

const releaseNotes = path.join(releaseDir, 'release-notes.md');
fs.writeFileSync(releaseNotes, changes);

console.log('\nRelease preparation complete!');
console.log(`\nVersion: ${version}`);
console.log('\nNext steps:');
console.log('1. Create a new GitHub release');
console.log('2. Tag name: v' + version);
console.log('3. Title: KnoksPix v' + version);
console.log('4. Copy the contents of release-notes.md');
console.log('5. Upload the following files:');
requiredFiles.forEach(file => console.log(`   - ${file}`));
