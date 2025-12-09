const fs = require('fs');
const path = require('path');

// Copy index.html to 404.html for GitHub Pages
// This allows client-side routing to work when users directly access or refresh dynamic routes
const outDir = path.join(process.cwd(), 'out');
const indexHtml = path.join(outDir, 'index.html');
const notFoundHtml = path.join(outDir, '404.html');

if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, notFoundHtml);
  console.log('✓ Copied index.html to 404.html for GitHub Pages');
} else {
  console.error('✗ index.html not found in out directory');
  process.exit(1);
}

