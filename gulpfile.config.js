/* eslint-env node */
const path = require('path');
const port = 3000;
const url = `http://localhost:${port}`;

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'public');

const htmlPattern = path.join(srcDir, '**/*.html');
const sassPattern = path.join(srcDir, 'sass', '**/*.scss');
const swPattern = path.join(srcDir, 'sw.js');
const jsPattern = path.join(srcDir, 'js', '**/*.js');

const imagePattern = path.join(srcDir, 'img', '**/*.jpg');
const iconPattern = path.join(srcDir, 'img', 'fixed', '**/*.{png,svg}');

module.exports = {
  dirname: __dirname,
  srcDir,
  distDir,
  server: { port, url },
  image: {
    quality: 50,
    sizes: [400, 800]
  },
  patterns: {
    html: htmlPattern,
    image: imagePattern,
    icon: iconPattern,
    js: jsPattern,
    sw: swPattern,
    sass: sassPattern
  }
};
