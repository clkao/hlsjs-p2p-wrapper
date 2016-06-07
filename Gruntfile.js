
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
        }
    });

    grunt.registerTask('wrapper', [
        'shell:install',
        'browserify:wrapper'
    ]);

    grunt.registerTask('wrapper_lite', [
        'shell:install',
        'browserify:wrapper_lite'
    ]);

    grunt.registerTask('demo', [
        'shell:install',
        'shell:update_demo',
        'browserify:wrapper',
        'browserify:wrapper_lite',
        'shell:start'
    ]);

    grunt.registerTask('docs', [
        'shell:install',
        'shell:docs',
        'shell:start'
    ]);
};
