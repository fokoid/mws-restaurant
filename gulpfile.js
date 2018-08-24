const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const sassPattern = 'sass/**/*.scss';
const distDir = 'public';

gulp.task('sass', () => {
  gulp.src(sassPattern).
    pipe(sass().on('error', sass.logError)).
    pipe(autoprefixer({
      'browsers': ['last 2 versions']
    })).
    pipe(gulp.dest(path.join(distDir, 'css')))
});

gulp.task('watchSass', ['sass'], () => void gulp.watch(sassPattern, ['sass']));

gulp.task('default', ['watchSass']);
