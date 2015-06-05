Tokenizer = {
  generate: function(params){
    var tokenRecord = {
      token: Random.secret(),
      address: params.user.emails[0].address,
      when: new Date(),
      expires: params.expires
    };

    Meteor.users.update(
      { _id: params.user._id },
      { $push: { 'services.email.verificationTokens': tokenRecord } }
    );

    return tokenRecord.token;
  },

  verify: function(){

  }
};
