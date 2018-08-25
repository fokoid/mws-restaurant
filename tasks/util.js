/* eslint-env node */
const fs = require('fs');
const {promisify} = require('util');
const del = require('del');
const mkdir = promisify(fs.mkdir);

module.exports = ({gulp, config}) => {
  gulp.task('clean', () => del([config.distDir]));
  gulp.task('mkdir', () => mkdir(config.distDir));
};
