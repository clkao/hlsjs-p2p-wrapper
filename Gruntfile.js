/*global module:false*/
module.exports = function (grunt) {

    //Load NPM tasks for dependencies
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        version: '<%= pkg.version %>',
        file_version: '',

        shell: {
            publish: {
                command: 'npm publish dist/',
            },
            install: {
                command: 'npm install'
            },
            example: {
                command: 'npm run example'
            },
            bundle: {
                command: 'npm run bundle'
            },
            server: {
                command: 'npm run server'
            },
            docs: {
                command: 'npm run docs'
            }
        },

        /* Compile & watch */
        browserify: {

            wrapper: {
                src: "lib/hlsjs-wrapper.js",
                dest: "dist/hlsjs-wrapper.js",
                options: {
                    transform: ['babelify'],
                    plugin: [
                      ['browserify-derequire']
                    ],
                    browserifyOptions: {
                        debug: true,
                        standalone: "StreamrootHlsjsWrapper"
                    },
                    watch: true,
                    keepAlive: true,
                }
            },

            bundle: {
                src: "lib/streamroot-hlsjs-bundle.js",
                dest: "dist/streamroot-hlsjs-bundle.js",
                options: {
                    transform: ['babelify'],
                    plugin: [
                      ['browserify-derequire']
                    ],
                    browserifyOptions: {
                        debug: true,
                        standalone: "StreamrootHlsjsBundle"
                    },
                    watch: true,
                    keepAlive: true,
                }
            },

            example:{
                src: "example/main.js",
                dest: "example/build.js",
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    watch: true,
                    keepAlive: true,
                }
            }
        },

        /* Release flow tasks */
        check_changelog: {
            options: {
                version: '<%= pkg.version %>'
            }
        },
        update_release_log: {
            options: {
                version: '<%= pkg.version %>'
            }
        },
        bump: {
            options: {
                files: ['package.json', 'dist/package.json'],
                updateConfigs: ['pkg'], // Updates so that tasks running in the same process see the updated value
                commit: true,
                createTag: true,
                push: false,
                pushTo: 'upstream',
                commitFiles: [
                    'package.json', 'dist/package.json', 'RELEASELOG.md'
                ], // '-a' for all files
                commitMessage: 'Release <%= version %>',
                tagName: 'v<%= version %>',
                tagMessage: 'Tagging version <%= version %>',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        }
    });

    grunt.registerTask('wrapper', [
        'shell:install',
        'browserify:wrapper'
    ]);

    grunt.registerTask('bundle', [
        'shell:install',
        'browserify:bundle'
    ]);

    grunt.registerTask('build', [
        'shell:install',
        'wrapper',
        'bundle'
    ]);

    grunt.registerTask('example', [
        'shell:install',
        'browserify:example'
    ]);

    grunt.registerTask('demo', [
        'shell:install',
        'shell:bundle',
        'shell:example',
        'shell:server'
    ]);

    grunt.registerTask('docs', [
        'shell:install',
        'shell:docs',
        'shell:server'
    ]);

    /* Publishes to NPM, updates release log and bumps version number */
    grunt.registerTask('release', [
        'check_changelog',
        'build',
        'shell:publish',
        'update_release_log',
        'bump',
        'post_build'
    ]);
};
