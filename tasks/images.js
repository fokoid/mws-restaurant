/* eslint-env node */
module.exports = ({gulp, config, imports}) => {
  const {
    path,
    del,
    mkdir,
    responsive
  } = imports;
  const imgDir = path.join(config.distDir, 'img');

  gulp.task('images:clean', () => del([imgDir]));
  gulp.task('images:mkdir', gulp.series('images:clean', () => mkdir(imgDir)));

  gulp.task('images:responsive', () => {
    const sizes = format => config.image.sizes.map(size => ({
      width: size,
      rename: {
        suffix: `-${size}`,
        extname: `.${format}`
      }
    }));

    return gulp.src(config.patterns.image).
      pipe(responsive({
        '*.jpg': sizes('jpg').concat(sizes('webp'))
      }, {
        quality: config.image.quality,
        progressive: true,
        widthMetadata: false,
        errorOnEnlargment: true
      })).
      pipe(gulp.dest(path.join(config.distDir, 'img')));
  });

  gulp.task('icons:copy', () => {
    return gulp.src(config.patterns.icon).
      pipe(gulp.dest(config.distDir));
  });

  gulp.task('images', gulp.series(
    'images:mkdir',
    gulp.parallel(
      'images:responsive',
      'icons:copy'
    )
  ));
};
