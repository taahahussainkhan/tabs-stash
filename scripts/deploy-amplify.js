const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const appId = 'd1rmonr4dy05xx';
const branchName = 'main';
const region = 'ap-south-1';
const profile = 'personal';

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const distDir = path.join(frontendDir, 'dist');
const zipPath = path.join(rootDir, 'frontend-build.zip');

console.log('🔨 Step 1: Building frontend for production deployment...');
execSync('npm run build', {
  cwd: frontendDir,
  env: {
    ...process.env,
    VITE_API_URL: 'https://pdh9ryeacb.execute-api.ap-south-1.amazonaws.com/api/v1',
    VITE_APP_ENV: 'production',
  },
  stdio: 'inherit',
});

console.log('🗜️ Step 2: Creating distribution archive for Amplify...');
if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath, { force: true });
}

execSync(`tar -a -c -f "${zipPath}" *`, {
  cwd: distDir,
  stdio: 'inherit',
});

console.log('📡 Step 3: Requesting Amplify deployment endpoint...');
const createDepOutput = execSync(
  `aws amplify create-deployment --app-id ${appId} --branch-name ${branchName} --region ${region} --profile ${profile}`,
  { encoding: 'utf8' }
);
const { jobId, zipUploadUrl } = JSON.parse(createDepOutput);
console.log(`✅ Deployment initialized (Job ID: ${jobId})`);

console.log('☁️ Step 4: Uploading bundle to Amplify S3 storage...');
const fileData = fs.readFileSync(zipPath);
const urlObj = new URL(zipUploadUrl);

function uploadFile() {
  return new Promise((resolve, reject) => {
    const req = https.request(
      urlObj,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/zip',
          'Content-Length': fileData.length,
        },
      },
      (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`S3 upload failed with status code ${res.statusCode}`));
        }
      }
    );
    req.on('error', reject);
    req.write(fileData);
    req.end();
  });
}

async function run() {
  await uploadFile();
  console.log('✅ Bundle uploaded successfully.');

  console.log('🚀 Step 5: Triggering Amplify live deployment...');
  execSync(
    `aws amplify start-deployment --app-id ${appId} --branch-name ${branchName} --job-id ${jobId} --region ${region} --profile ${profile}`,
    { stdio: 'inherit' }
  );

  console.log('\n🎉 Frontend successfully deployed to AWS Amplify!');
  console.log(`🔗 Live URL: https://${branchName}.${appId}.amplifyapp.com`);
  console.log(`🔗 Root URL: https://${appId}.amplifyapp.com\n`);

  // Cleanup zip
  if (fs.existsSync(zipPath)) {
    fs.rmSync(zipPath, { force: true });
  }
}

run().catch((err) => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
