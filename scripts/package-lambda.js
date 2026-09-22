const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const terraformDir = path.join(rootDir, 'terraform');
const stagingDir = path.join(os.tmpdir(), `lore-lambda-${Date.now()}`);
const zipPath = path.join(terraformDir, 'lambda_payload.zip');

console.log('🔨 Step 1: Compiling server TypeScript...');
execSync('npm run build', { cwd: serverDir, stdio: 'inherit' });

console.log('🧹 Step 2: Preparing staging directory:', stagingDir);
fs.mkdirSync(stagingDir, { recursive: true });

// Copy dist directory
console.log('📋 Copying dist output...');
fs.cpSync(path.join(serverDir, 'dist'), path.join(stagingDir, 'dist'), { recursive: true });

// Copy package.json
console.log('📋 Copying package.json...');
fs.copyFileSync(path.join(serverDir, 'package.json'), path.join(stagingDir, 'package.json'));

// Install clean production dependencies
console.log('📦 Installing production dependencies in staging...');
execSync('npm install --omit=dev --no-audit --no-fund --ignore-scripts', {
  cwd: stagingDir,
  stdio: 'inherit',
});

// Remove old zip if present
if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath, { force: true });
}

// Create ZIP file using tar
console.log(`🗜️ Creating Lambda deployment archive: ${zipPath}...`);
try {
  execSync(`tar -a -c -f "${zipPath}" *`, {
    cwd: stagingDir,
    stdio: 'inherit',
  });
  const stats = fs.statSync(zipPath);
  console.log(`✅ Lambda payload packaged successfully! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
} finally {
  // Cleanup staging directory
  console.log('🧹 Cleaning staging directory...');
  try {
    fs.rmSync(stagingDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
  } catch (e) {
    // Ignore tmp dir cleanup failures
  }
}
