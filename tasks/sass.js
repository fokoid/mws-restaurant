/* eslint-env node */
const path = require('path');
const {promisify} = require('util');
const fs = require('fs');
const mkdir = promisify(fs.mkdir);
const del = require('del');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const bs = require('browser-sync');

module.exports = ({gulp, config}) => {
  const cssDir = path.join(config.distDir, 'css');

  gulp.task('sass:clean', () => del([cssDir]));
  gulp.task('sass:mkdir', gulp.series('sass:clean', () => mkdir(cssDir)));

  gulp.task('sass:build', gulp.series('sass:clean', 'sass:mkdir', () => {
    return gulp.src(config.patterns.sass).
      pipe(sourcemaps.init()).
      pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)).
      pipe(autoprefixer({
        'browsers': ['last 2 versions']
      })).
      pipe(sourcemaps.write('.')).
      pipe(gulp.dest(cssDir)).
      pipe(bs.stream());
  }));

  gulp.task('sass', gulp.series('sass:build'));
};
