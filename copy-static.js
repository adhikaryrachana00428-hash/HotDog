import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = __dirname;
const destDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Files in the root directory to copy to dist
const files = fs.readdirSync(srcDir);

files.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);

  // Skip directories, hidden files, and build/config files
  if (fs.statSync(srcPath).isDirectory()) return;
  if (file.startsWith('.')) return;
  if (['package.json', 'package-lock.json', 'tsconfig.json', 'README.md', 'copy-static.js', 'vercel.json'].includes(file)) return;

  // Copy html, css, js files
  if (file.endsWith('.html') || file.endsWith('.css') || (file.endsWith('.js') && !file.endsWith('.test.js'))) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to dist/`);
  }
});
