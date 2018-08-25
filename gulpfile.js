/* eslint-env node */
const gulp = require('gulp');

const config = require('./gulpfile.config.js');
const imports = require('./gulpfile.imports.js');
const {browserSync} = imports;

const taskFiles = [
  './tasks/util.js',
  './tasks/html.js',
  './tasks/sass.js',
  './tasks/js.js',
  './tasks/images.js',
  './tasks/misc.js'
];
taskFiles.forEach(taskFile => {
  require(taskFile)({gulp, config, imports});
});

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
  browserSync.init({
    proxy: config.server.url
  });
  gulp.watch(config.patterns.sass, gulp.series('sass'));
  gulp.watch(config.patterns.html, gulp.series('html')).
    on('change', browserSync.reload);
  gulp.watch([config.patterns.js, config.patterns.sw], gulp.series('js')).
    on('change', browserSync.reload);
}));

gulp.task('default', gulp.series('serve'));
