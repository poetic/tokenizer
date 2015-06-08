Package.describe({
  name: 'poetic:tokenizer',
  version: '0.0.1',
  summary: 'create tokens to validate user interactions',
  git: 'https://github.com/poetic/tokenizer',
  documentation: 'README.md'
});

Package.onUse(function(api){
  api.versionsFrom('1.1.0.2');

  api.use('accounts-base', ['client', 'server']);
  api.use('momentjs:moment', ['client', 'server']);

  api.addFiles('tokenizer.js', ['client', 'server']);
  api.export('Tokenizer');
});

Package.onTest(function(api){});
