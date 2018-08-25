/* eslint-env node */
const path = require('path');
const del = require('del');
const mkdirp = require('mkdirp');
const gulp = require('gulp');
const responsive = require('gulp-responsive');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const eslint = require('gulp-eslint');

const distDir = 'public';

const sassPattern = 'sass/**/*.scss';
const cssDir = path.join(distDir, 'css');

const jsPattern = path.join(distDir, 'js/**/*.js');

const imagePattern = 'img_src/**/*.jpg';
const iconPattern = 'img_src/fixed/**/*.png';
const imageDir = path.join(distDir, 'img');
const imageSizes = [400, 800];
const imageQuality = 50;

gulp.task('sass:clean', () => del([cssDir]));
gulp.task('sass:mkdir', () => mkdirp(cssDir));
gulp.task('sass', ['sass:clean', 'sass:mkdir'], () => {
  return gulp.src(sassPattern).
    pipe(sass().on('error', sass.logError)).
    pipe(autoprefixer({
      'browsers': ['last 2 versions']
    })).
    pipe(gulp.dest(cssDir));
});

gulp.task('images', [
  'images:clean',
  'images:mkdir',
  'images:responsive',
  'images:icons'
]);
gulp.task('images:clean', () => del([imageDir]));
gulp.task('images:mkdir', () => mkdirp(imageDir));
gulp.task('images:responsive', () => {
  const sizes = format => imageSizes.map(size => ({
    width: size,
    rename: {
      suffix: `-${size}`,
      extname: `.${format}`
    }
  }));

  return gulp.src(imagePattern).
    pipe(responsive({
      '*.jpg': sizes('jpg').concat(sizes('webp'))
    }, {
      quality: imageQuality,
      progressive: true,
      widthMetadata: false,
      errorOnEnlargment: true
    })).
    pipe(gulp.dest(imageDir));
});
gulp.task('images:icons', () => {
  return gulp.src(iconPattern).
    pipe(gulp.dest(imageDir));
});

gulp.task('eslint', () => {
  return gulp.src(jsPattern).
    pipe(eslint()).
    pipe(eslint.format()).
    pipe(eslint.failOnError());
});

gulp.task('watchSass', ['sass'], () => void gulp.watch(sassPattern, ['sass']));

gulp.task('default', ['watchSass', 'eslint']);
