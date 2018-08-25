/* eslint-env node */
const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const mkdir = promisify(fs.mkdir);

module.exports = {
  path,
  mkdir,
  del: require('del'),
  concat: require('gulp-concat'),
  merge: require('merge-stream'),
  sourcemaps: require('gulp-sourcemaps'),
  sass: require('gulp-sass'),
  autoprefixer: require('gulp-autoprefixer'),
  uglifyES: require('gulp-uglify-es'),
  eslint: require('gulp-eslint'),
  responsive: require('gulp-responsive'),
  browserSync: require('browser-sync')
};
