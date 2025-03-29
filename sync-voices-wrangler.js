#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const R2_BUCKET_NAME = 'ti4-lab-audio';
const VOICES_DIR = path.join(__dirname, 'assets', 'voices');

// Cache file to store file hashes
const CACHE_FILE = path.join(__dirname, '.voice-sync-cache.json');

// Load or initialize cache
let fileCache = {};
if (fs.existsSync(CACHE_FILE)) {
  fileCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
}

// Calculate file hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

// Get all MP3 files recursively
function getVoiceFiles(dir, fileList = []) {
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    console.log(`📁 Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getVoiceFiles(filePath, fileList);
    } else if (path.extname(filePath).toLowerCase() === '.mp3') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

try {
  console.log('📂 Syncing voice files to Cloudflare R2...');

  // Get all voice files
  const voiceFiles = getVoiceFiles(VOICES_DIR);

  // Check which files have changed
  const changedFiles = [];

  voiceFiles.forEach(filePath => {
    const relativePath = path.relative(VOICES_DIR, filePath);
    const r2Path = `voices/${relativePath.replace(/\\/g, '/')}`;
    const currentHash = getFileHash(filePath);

    if (!fileCache[relativePath] || fileCache[relativePath] !== currentHash) {
      changedFiles.push({ localPath: filePath, r2Path, hash: currentHash });
      fileCache[relativePath] = currentHash;
    }
  });

  if (changedFiles.length === 0) {
    console.log('✅ All files already up to date!');
  } else {
    console.log(`🔄 Found ${changedFiles.length} files to upload:`);

    // Upload each changed file
    changedFiles.forEach(file => {
      console.log(`  - ${file.r2Path}`);
      execSync(
        `npx wrangler r2 object put ${R2_BUCKET_NAME}/${file.r2Path} --file=${file.localPath} --remote`,
        { stdio: 'inherit' }
      );
    });

    console.log('✅ Voice files sync complete!');
  }

  // Save updated cache
  fs.writeFileSync(CACHE_FILE, JSON.stringify(fileCache, null, 2));

} catch (error) {
  console.error('❌ Error syncing voice files:', error.message);
  process.exit(1);
}