var browsers = ['PhantomJS_custom'];

if (process.env.NODE_ENV === 'development') {
	browsers.push('Chrome_without_security');
}

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'should'],
    files: [
      'test/html/build.js'
    ],
    browsers: browsers,
    plugins: [
    	'karma-mocha',
    	'karma-should',
    	'karma-chrome-launcher',
    	'karma-phantomjs-launcher'
    ],

    customLaunchers: {
      'PhantomJS_custom': {
        base: 'PhantomJS',
        options: {
          settings: {
            webSecurityEnabled: false
          },
        },
        flags: ['--load-images=true']
      },
      'Chrome_without_security': {
        base: 'Chrome',
        flags: ['--disable-web-security']
      }
    },
  });
};
