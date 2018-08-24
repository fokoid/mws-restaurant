/* eslint-env node */
const path = require('path');
const imageSrcDir = 'img_src/';
const imageDir = path.join(__dirname, 'public', 'img');
const imageWidths = [400, 800];
const jpegQuality = 50;
const webpQuality = 50;

module.exports = grunt => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    responsive_images: {
      dev: {
        options: {
          engine: 'gm',
          sizes: imageWidths.map(width => ({
            width,
            suffix: '',
            quality: jpegQuality
          })),
        },
        files: [{
          expand: true,
          src: ['*.jpg'],
          cwd: imageSrcDir,
          dest: imageDir
        }]
      }
    },

    cwebp: {
      dynamic: {
        options: {
          q: webpQuality
        },
        files: [{
          expand: true,
          cwd: imageDir,
          src: ['*.jpg'],
          dest: imageDir
        }]
      }
    },

    clean: {
      dev: {
        src: [imageDir]
      }
    },

    mkdir: {
      dev: {
        options: {
          create: [imageDir]
        }
      }
    },

    copy: {
      dev: {
        files: [{
          expand: true,
          cwd: path.join(imageSrcDir, 'fixed'),
          src: '*.png',
          dest: imageDir
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-cwebp');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', [
    'clean',
    'mkdir',
    'copy',
    'responsive_images',
    'cwebp'
  ]);
};
