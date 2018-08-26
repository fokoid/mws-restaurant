/* eslint-env node */
module.exports = ({gulp, config, imports}) => {
  const {
    path,
    del,
    mkdir,
    eslint,
    sourcemaps,
    concat,
    uglifyES
  } = imports;
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
        stream = stream.pipe(uglifyES());
      return stream.
        pipe(sourcemaps.write('.')).
        pipe(gulp.dest(jsDir));
    });
  };
  //jsTask({name: 'main', dist: false});
  //jsTask({name: 'main', dist: true});
  //jsTask({name: 'restaurant_info', dist: false});
  //jsTask({name: 'restaurant_info', dist: true});

  gulp.task('js:build', gulp.series('js:mkdir', () => {
    return gulp.src(config.patterns.js).
      pipe(gulp.dest(jsDir));
  }));
  const jsTaskAll = ({dist = false}) => {
    gulp.task(`js:scripts${dist?':dist':''}`, gulp.series(
      'js:mkdir',
      gulp.parallel(
        `js:main${dist?':dist':''}`,
        `js:restaurant_info${dist?':dist':''}`
      )
    ));
  };
  //jsTaskAll({dist: false});
  //jsTaskAll({dist: true});

  gulp.task('sw:copy', () => {
    return gulp.src([config.patterns.sw]).
      pipe(gulp.dest(config.distDir));
  });

  gulp.task('js', gulp.series(
    'js:eslint',
    gulp.parallel(
      'js:build',
      'sw:copy'
    )
  ));
};
