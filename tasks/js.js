/* eslint-env node */
const path = require('path');
const {promisify} = require('util');
const fs = require('fs');
const mkdir = promisify(fs.mkdir);
const del = require('del');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');

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

  const jsTask = ({name, dist = false}) => {
    gulp.task(`js:${name}${dist?':dist':''}`, () => {
      const files = [
        'idb.js',
        'shared.js',
        'dbhelper.js',
        `${name}.js`
      ].map(file => path.join(config.srcDir, 'js', file));
      let stream = gulp.src(files).
        pipe(sourcemaps.init()).
        pipe(concat(`${name}.js`));
      if (dist)
        stream = stream.pipe(uglify());
      return stream.
        pipe(sourcemaps.write('.')).
        pipe(gulp.dest(jsDir));
    });
  };
  jsTask({name: 'main', dist: false});
  jsTask({name: 'main', dist: true});
  jsTask({name: 'restaurant_info', dist: false});
  jsTask({name: 'restaurant_info', dist: true});

  const jsTaskAll = ({dist = false}) => {
    gulp.task(`js:scripts${dist?':dist':''}`, gulp.series(
      'js:mkdir',
      gulp.parallel(
        `js:main${dist?':dist':''}`,
        `js:restaurant_info${dist?':dist':''}`
      )
    ));
  };
  jsTaskAll({dist: false});
  jsTaskAll({dist: true});

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
