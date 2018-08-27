/* eslint-env node */
module.exports = ({gulp, config, imports}) => {
  const {
    path,
    del,
    mkdir,
    responsive
  } = imports;
  const imgDir = path.join(config.distDir, 'img');
  const iconDir = path.join(config.distDir, 'icon');

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
        '*.jpg': sizes('jpg').concat(sizes('webp')),
        '*.png': sizes('png')
      }, {
        quality: config.image.quality,
        progressive: true,
        widthMetadata: false,
        errorOnEnlargment: true
      })).
      pipe(gulp.dest(imgDir));
  });

  gulp.task('icons:clean', () => del([iconDir]));
  gulp.task('icons:mkdir', gulp.series('icons:clean', () => mkdir(iconDir)));

  gulp.task('icons:copy', () => {
    return gulp.src(config.patterns.icon).
      pipe(gulp.dest(iconDir));
  });

  gulp.task('images', gulp.series(
    'images:mkdir',
    gulp.parallel(
      'images:responsive',
      'icons:copy'
    )
  ));
};
