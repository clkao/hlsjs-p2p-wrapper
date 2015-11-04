/*global module:false*/
module.exports = function(grunt) {

    //Load NPM tasks for dependencies
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        version: '<%= pkg.version %>',
        file_version: '',

        browserify: {
            hls_js_provider:{
                src: "lib/html5.provider.hlsjs.js",
                dest: "dist/jw71-provider-HLS.js",
                options: {
                    transform: [['uglifyify', {
                        compress: {
                            drop_console : true,
                        },
                        mangle: true,
                        global: true
                    }]],
                    watch: false,
                    keepAlive: false,
                }
            }
        },
        
        shell: {
            npmPublish: {
                command: 'npm publish',
            }
        },
        
        check_changelog: {
            options: {
                version : '<%= pkg.version %>'
            }
        },
        update_release_log: {
            options: {
                version : '<%= pkg.version %>'
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'], // Updates so that tasks running in the same process see the updated value
                commit: true,
                createTag: true,
                push: false,
                pushTo: 'upstream',
                commitFiles: ['package.json', 'releaseLog.md'], // '-a' for all files
                commitMessage: 'Release <%= version %>',
                tagName: 'v<%= version %>',
                tagMessage: 'Tagging version <%= version %>',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            },
        }
    });

    // Default task.
    grunt.registerTask('default', ['browserify']);

    //This task is used to make a preprod build and push it to S3, see structureProd for an explanation
    grunt.registerTask('release', [
        'pre_build',
        'check_changelog',
        'shell:npmPublish',
        'update_release_log',
        'bump',
        'post_build']);
};