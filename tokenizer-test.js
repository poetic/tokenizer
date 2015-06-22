Tinytest.add('Tokenizer.generate outputs a string', function(test){
  var user = {emails: ['test@exampletester.com']}

  var token = Tokenizer.generate({
    user: user,
    expires: {minutes: 10}
  });

  test.isNotNull(token);
});
