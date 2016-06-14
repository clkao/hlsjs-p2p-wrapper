
function makeBrowserifyTask (src, dest, standalone, dev) {
    const task = {
        src: src,
        dest: dest,
        options: {
            transform: ['babelify', ['uglifyify', {
                    global: true,
                    compress: {
                        drop_console: true,
                    }
            }]],
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
            wrapper:     makeBrowserifyTask("lib/hlsjs-p2p-wrapper.js",
                                                 "dist/wrapper/hlsjs-p2p-wrapper.js",
                                                 "HlsjsP2PWrapper",
                                                 false),
            wrapper_dev: makeBrowserifyTask("lib/hlsjs-p2p-wrapper.js",
                                                 "dist/wrapper/hlsjs-p2p-wrapper.js",
                                                 "HlsjsP2PWrapper",
                                                 true),
            bundle:          makeBrowserifyTask("lib/hlsjs-p2p-bundle.js",
                                                 "dist/bundle/hlsjs-p2p-bundle.js",
                                                 "Hls",
                                                 false),
            bundle_dev:      makeBrowserifyTask("lib/hlsjs-p2p-bundle.js",
                                                 "dist/bundle/hlsjs-p2p-bundle.js",
                                                 "Hls",
                                                 true),
            test_dev: makeBrowserifyTask("test/html/tests.js",
                                    "test/html/build.js",
                                    "Tests",
                                    true),
            test: makeBrowserifyTask("test/html/tests.js",
                                    "test/html/build.js",
                                    "Tests",
                                    false)

        }
    });

    grunt.registerTask('bundle', [
        'shell:install',
        'browserify:bundle'
    ]);

    grunt.registerTask('wrapper', [
        'shell:install',
        'browserify:wrapper'
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
};
