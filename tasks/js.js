/* eslint-env node */
const path = require('path');
const {promisify} = require('util');
const fs = require('fs');
const mkdir = promisify(fs.mkdir);
const del = require('del');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');

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

  const jsTask = name => {
    gulp.task(`js:${name}`, () => {
      const files = [
        'idb.js',
        'shared.js',
        'dbhelper.js',
        `${name}.js`
      ].map(file => path.join(config.srcDir, 'js', file));
      return gulp.src(files).
        pipe(concat(`${name}.js`)).
        pipe(gulp.dest(jsDir));
    });
  };
  jsTask('main');
  jsTask('restaurant_info');

  gulp.task('js:scripts', gulp.series(
    'js:mkdir',
    gulp.parallel(
      'js:main',
      'js:restaurant_info'
    )
  ));

  gulp.task('sw:copy', () => {
    return gulp.src([config.patterns.sw]).
      pipe(gulp.dest(config.distDir));
  });

  gulp.task('js', gulp.series(
    'js:eslint',
    gulp.parallel(
      'js:scripts',
      'sw:copy'
    )
  ));
};
