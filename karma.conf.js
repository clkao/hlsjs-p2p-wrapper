module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'should'],

    files: [
      'test/html/build.js'
    ],

    browsers: ['Chrome'],

    singleRun: true
  });
};
