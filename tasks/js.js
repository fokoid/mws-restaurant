/* eslint-env node */
module.exports = ({gulp, config, imports}) => {
  const {
    path,
    del,
    mkdir,
    eslint,
    sourcemaps,
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

  gulp.task('js:build', gulp.series('js:mkdir', () => {
    let stream = gulp.src(config.patterns.js).pipe(sourcemaps.init());
    if (process.env.NODE_ENV === 'production')
      stream = stream.pipe(uglifyES());
    return stream.pipe(sourcemaps.write('.')).pipe(gulp.dest(jsDir));
  }));

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
