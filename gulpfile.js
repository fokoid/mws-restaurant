/* eslint-env node */
const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const eslint = require('gulp-eslint');

const sassPattern = 'sass/**/*.scss';
const distDir = 'public';
const jsPattern = path.join(distDir, 'js/**/*.js');

gulp.task('sass', () => {
  gulp.src(sassPattern).
    pipe(sass().on('error', sass.logError)).
    pipe(autoprefixer({
      'browsers': ['last 2 versions']
    })).
    pipe(gulp.dest(path.join(distDir, 'css')));
});

gulp.task('eslint', () => {
  gulp.src(jsPattern).
    pipe(eslint()).
    pipe(eslint.format()).
    pipe(eslint.failOnError());
});

gulp.task('watchSass', ['sass'], () => void gulp.watch(sassPattern, ['sass']));

gulp.task('default', ['watchSass', 'eslint']);
