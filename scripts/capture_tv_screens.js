const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TV_IP = '192.168.1.64:5555';
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

console.log(`Starting Screen Capture Monitor for ${TV_IP}...`);
console.log(`Screenshots will be saved in: ${SCREENSHOT_DIR}`);

let lastHash = '';
let count = 1;

function getAdbPath() {
  const possiblePaths = [
    'adb',
    'C:\\Users\\Asus\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe'
  ];
  return possiblePaths[1];
}

const adb = getAdbPath();

async function capture() {
  try {
    const tmpDevicePath = '/sdcard/temp_sc.png';
    execSync(`"${adb}" -s ${TV_IP} shell screencap -p ${tmpDevicePath}`, { stdio: 'pipe' });
    const localTmp = path.join(SCREENSHOT_DIR, 'temp_raw.png');
    execSync(`"${adb}" -s ${TV_IP} pull ${tmpDevicePath} "${localTmp}"`, { stdio: 'pipe' });

    if (fs.existsSync(localTmp)) {
      const buffer = fs.readFileSync(localTmp);
      const hash = crypto.createHash('md5').update(buffer).digest('hex');

      if (hash !== lastHash) {
        lastHash = hash;
        const pad = String(count).padStart(3, '0');
        const filename = `screen_${pad}.png`;
        const targetPath = path.join(SCREENSHOT_DIR, filename);
        fs.copyFileSync(localTmp, targetPath);
        console.log(`[Captured] ${filename} (Hash: ${hash.substring(0, 8)})`);
        count++;
      }
    }
  } catch (err) {
    console.error('Error during capture:', err.message);
  }
}

// Continuous loop
async function run() {
  while (true) {
    await capture();
    await new Promise(r => setTimeout(r, 1200));
  }
}

run();
