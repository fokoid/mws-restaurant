/* eslint-env node */
const path = require('path');
const {promisify} = require('util');
const fs = require('fs');
const mkdir = promisify(fs.mkdir);
const del = require('del');
const eslint = require('gulp-eslint');

module.exports = ({gulp, config}) => {
  const jsDir = path.join(config.distDir, 'js');

  gulp.task('js:eslint', () => {
    return gulp.src([config.patterns.js, config.patterns.sw]).
      pipe(eslint()).
      pipe(eslint.format()).
      pipe(eslint.failOnError());
  });

  gulp.task('js:clean', () => del([jsDir]));
  gulp.task('js:mkdir', gulp.series('js:clean', () => mkdir(jsDir)));

  gulp.task('js:copy', gulp.series('js:mkdir', () => {
    return gulp.src([config.patterns.js]).
      pipe(gulp.dest(jsDir));
  }));

  gulp.task('sw:copy', () => {
    return gulp.src([config.patterns.sw]).
      pipe(gulp.dest(config.distDir));
  });

  gulp.task('js', gulp.series(
    'js:eslint',
    gulp.parallel(
      'js:copy',
      'sw:copy'
    )
  ));
};
