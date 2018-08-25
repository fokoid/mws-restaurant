/* eslint-env node */
module.exports = ({gulp, config}) => {
  gulp.task('html:copy', () => {
    return gulp.src(config.patterns.html).
      pipe(gulp.dest(config.distDir));
  });

  gulp.task('html', gulp.series('html:copy'));
};
