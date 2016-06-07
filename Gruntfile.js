
function makeBrowserifyTask (src, dest, standalone, dev) {
    const task = {
        src: src,
        dest: dest,
        options: {
            transform: ['babelify'/*, ['uglifyify', {
                    global: true,
                    compress: {
                        drop_console: true,
                    }
            }]*/],
            plugin: [
              ['browserify-derequire']
            ],
            browserifyOptions: {
                debug: dev,
                standalone: standalone
            },
            watch: dev,
            keepAlive: dev
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
                command: 'npm publish dist/wrapper && npm publish dist/wrapper_lite',
            },
            install: {
                command: 'npm install'
            },
            start: {
                command: 'npm run start'
            },
            docs: {
                command: 'npm run docs'
            },
            update_demo: {
                command: './update_demo.rb'
            }
        },

        /* Compile & watch */
        browserify: {
            wrapper_lite:     makeBrowserifyTask("lib/hlsjs-p2p-wrapper-lite.js",
                                                 "dist/wrapper_lite/hlsjs-p2p-wrapper.js",
                                                 "HlsjsP2PWrapper",
                                                 false),
            wrapper_lite_dev: makeBrowserifyTask("lib/hlsjs-p2p-wrapper-lite.js",
                                                 "dist/wrapper/hlsjs-p2p-wrapper.js",
                                                 "HlsjsP2PWrapper",
                                                 true),
            wrapper:          makeBrowserifyTask("lib/hlsjs-p2p-wrapper.js",
                                                 "dist/wrapper/hlsjs-p2p-wrapper.js",
                                                 "Hls",
                                                 false),
            wrapper_dev:      makeBrowserifyTask("lib/hlsjs-p2p-wrapper.js",
                                                 "dist/wrapper/hlsjs-p2p-wrapper.js",
                                                 "Hls",
                                                 true),
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

    grunt.registerTask('demo', [
        'shell:install',
        'shell:update_demo',
        'browserify:bundle',
        'browserify:wrapper',
        'shell:start'
    ]);

    grunt.registerTask('docs', [
        'shell:install',
        'shell:docs',
        'shell:start'
    ]);

    /* Publishes to NPM, updates release log and bumps version number */
    grunt.registerTask('release', [
        'pre_build',
        'check_changelog',
        'build',
        'shell:publish',
        'update_release_log',
        'bump',
        'post_build'
    ]);
};
