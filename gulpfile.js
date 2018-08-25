/* eslint-env node */
const gulp = require('gulp');
const bs = require('browser-sync');

const config = require('./gulpfile.config.js');
const taskFiles = [
  './tasks/util.js',
  './tasks/html.js',
  './tasks/sass.js',
  './tasks/js.js',
  './tasks/images.js',
  './tasks/misc.js'
];
taskFiles.forEach(taskFile => void require(taskFile)({gulp, config}));

gulp.task('build', gulp.series(
  'clean',
  'mkdir',
  gulp.parallel(
    'html',
    'sass',
    'js',
    'images',
    'misc'
  )
));

gulp.task('serve', gulp.series('build', () => {
  bs.init({
    proxy: config.server.url
  });
  gulp.watch(config.patterns.sass, gulp.series('sass'));
  gulp.watch(config.patterns.html, gulp.series('html')).on('change', bs.reload);
  gulp.watch([config.patterns.js, config.patterns.sw], gulp.series('js')).
    on('change', bs.reload);
}));

gulp.task('default', gulp.series('serve'));
