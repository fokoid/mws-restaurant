/* eslint-env node */
module.exports = ({gulp, config, imports}) => {
  const {
    path,
    del,
    mkdir,
    sourcemaps,
    sass,
    autoprefixer,
    browserSync
  } = imports;
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
      pipe(browserSync.stream());
  }));

  gulp.task('sass', gulp.series('sass:build'));
};
