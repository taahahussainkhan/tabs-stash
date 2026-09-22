const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2] || 'all'; // 'chrome', 'firefox', or 'all'
const rootDir = path.resolve(__dirname, '..');
const extensionDir = path.join(rootDir, 'extension');
const distPkgDir = path.join(rootDir, 'dist_pkg');
const releasesDir = path.join(rootDir, 'releases');

// Ensure output dirs exist
if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

function packageTarget(browserName) {
  const pkgName = `lore-${browserName}`;
  const stagingDir = path.join(distPkgDir, pkgName);
  const zipPath = path.join(releasesDir, `${pkgName}-v3.0.0.zip`);

  console.log(`\n📦 Packaging ${browserName.toUpperCase()} extension...`);

  // Clean staging
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  // Copy extension files
  fs.cpSync(extensionDir, stagingDir, { recursive: true });

  // Tailor manifest for browser target
  const stagedManifestPath = path.join(stagingDir, 'manifest.json');
  if (fs.existsSync(stagedManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(stagedManifestPath, 'utf8'));
    if (browserName === 'chrome') {
      manifest.background = { service_worker: 'background.js' };
    } else if (browserName === 'firefox') {
      manifest.background = { scripts: ['background.js'] };
    }
    fs.writeFileSync(stagedManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  }

  // Create zip using tar (built-in on Windows 10+, macOS, Linux)
  try {
    execSync(`tar -a -c -f "${zipPath}" -C "${distPkgDir}" "${pkgName}"`, {
      stdio: 'inherit',
    });
    console.log(`✅ Successfully created: ${zipPath}`);
  } catch (err) {
    console.error(`❌ Failed to zip ${pkgName}:`, err.message);
  } finally {
    // Cleanup staging
    if (fs.existsSync(stagingDir)) {
      fs.rmSync(stagingDir, { recursive: true, force: true });
    }
  }
}

try {
  if (target === 'chrome' || target === 'all') {
    packageTarget('chrome');
  }
  if (target === 'firefox' || target === 'all') {
    packageTarget('firefox');
  }
  if (fs.existsSync(distPkgDir)) {
    fs.rmSync(distPkgDir, { recursive: true, force: true });
  }
  console.log('\n🎉 Packaging complete!\n');
} catch (e) {
  console.error('Packaging failed:', e);
  process.exit(1);
}
