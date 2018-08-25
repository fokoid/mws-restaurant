/* eslint-env node */
module.exports = ({gulp, config, imports}) => {
  const {del, mkdir} = imports;
  gulp.task('clean', () => del([config.distDir]));
  gulp.task('mkdir', () => mkdir(config.distDir));
};
