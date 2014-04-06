'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        lmd: {
            // Development build
            dev: 'dev',

            // Development with cache
            // All in one example
            dev_cache: {
                build: 'dev-cache',
                projectRoot: __dirname
            },

            // Development with cache
            // All in one example
            dev_no_ie: {
                build: 'dev',
                options: {
                    ie: false,
                    banner: '// No IE!',
                    output: '../compiled/dev-no-ie.lmd.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-lmd');

    // Default task.
    grunt.registerTask('default', ['lmd:dev']);
};
