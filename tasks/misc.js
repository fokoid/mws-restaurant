/* eslint-env node */
const path = require('path');
const merge = require('merge-stream');

module.exports = ({gulp, config}) => {
  const srcFiles = [
    'favicon.ico',
    'manifest.json'
  ].map(file => path.join(config.srcDir, file));


  gulp.task('misc:copy', () => {
    const streams = srcFiles.map(srcFile => {
      return gulp.src(srcFile).
        pipe(gulp.dest(config.distDir));
    });
    return merge(streams);
  });

  gulp.task('misc', gulp.series('misc:copy'));
};
