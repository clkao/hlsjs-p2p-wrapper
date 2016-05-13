const WATCH = false;
const DEBUG = false;
const KEEP_ALIVE = false;

function makeBrowserifyTask (src, dest, standalone, watch, debug) {
    const task = {
        src: src,
        dest: dest,
        options: {
            transform: ['babelify'],
            plugin: [
              ['browserify-derequire']
            ],
            browserifyOptions: {
                debug: debug,
                standalone: standalone
            },
            watch: watch,
            keepAlive: KEEP_ALIVE
        }
    }
    return task;
}

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
                command: 'npm publish dist/bundle && npm publish dist/wrapper',
            },
            install: {
                command: 'npm install'
            },
            start: {
                command: 'npm run start'
            },
            docs: {
                command: 'npm run docs'
            }
        },

        /* Compile & watch */
        browserify: {
            wrapper: makeBrowserifyTask ("lib/hlsjs-wrapper.js",
                                    "dist/wrapper/hlsjs-wrapper.js",
                                    "StreamrootHlsjsWrapper",
                                    WATCH, DEBUG),
            bundle: makeBrowserifyTask ("lib/streamroot-hlsjs-bundle.js",
                                    "dist/bundle/streamroot-hlsjs-bundle.js",
                                    "StreamrootHlsjsBundle",
                                    WATCH, DEBUG),
            example: makeBrowserifyTask ("example/main.js",
                                         "example/build.js",
                                          null,
                                          WATCH, DEBUG)
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
        'browserify:wrapper',
        'browserify:bundle'
    ]);

    grunt.registerTask('example', [
        'shell:install',
        'browserify:example'
    ]);

    grunt.registerTask('demo', [
        'shell:install',
        'browserify:bundle',
        'browserify:example',
        'shell:start'
    ]);

    grunt.registerTask('docs', [
        'shell:install',
        'shell:docs',
        'shell:start'
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
