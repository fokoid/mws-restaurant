const path = require('path');
const imageDir = path.join(__dirname, 'img');
const imageWidths = [200, 400, 800];
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
          src: ['**/*.jpg'],
          cwd: 'img_src/',
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
          src: ['**/*.jpg'],
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
    }
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-cwebp');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', [
    'clean',
    'mkdir',
    'responsive_images',
    'cwebp'
  ]);
};
