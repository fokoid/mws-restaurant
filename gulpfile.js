const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

const distDir = 'public';
const sassPattern = 'sass/**/*.scss';

gulp.task('serve', () => {
  browserSync.init({
    server: './public/',
    browser: 'google-chrome-unstable'
  })
  browserSync.stream();
});

gulp.task('styles', () => {
  gulp.src(sassPattern)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest(path.join(distDir, 'css')));
});

gulp.task('default', ['serve']);
