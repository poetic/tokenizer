Package.describe({
  name: 'poetic:tokenizer',
  version: '0.0.6',
  summary: 'create tokens to validate user interactions',
  git: 'https://github.com/poetic/tokenizer',
  documentation: 'README.md'
});

Package.onUse(function(api){
  api.versionsFrom('1.1.0.2');

  api.use('accounts-base', ['client', 'server']);
  api.use('momentjs:moment@2.10.3', ['client', 'server']);

  api.addFiles('tokenizer.js', ['client', 'server']);
  api.export('Tokenizer');
});

Package.onTest(function(api){
  api.use(['poetic:tokenizer', 'tinytest', 'test-helpers']);
  api.addFiles('tokenizer-test.js');
});
