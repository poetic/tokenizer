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

  verify: function(token, callback){
    Meteor.call('verifyToken', token, function(result){
      if (result.error) { return callback(result.error) }

      Accounts.verifyEmail(token, function(e){
        if (e) {
          callback(new Error('token is not valid'));
        } else {
          callback(null, true);
        }
      });
    });
  }
};

Meteor.methods({
  verifyToken: function(token){
    var result = {};
    var user;
    var tokenRecord;

    if (Meteor.isServer) {
      user = Meteor.users.findOne({
        'services.email.verificationTokens.token': token
      });

      if (user) {
        tokenRecord = _.find(user.services.email.verificationTokens, function(tokenObj){
          return tokenObj.token = token;
        });

        if (tokenRecord.expires) {
          var interval = Object.keys(tokenRecord.expires)[0];
          var quantity = tokenRecord.expires[interval];

          var expiration = moment(tokenRecord.when).add(quantity, interval);
          var now = moment();

          if (now.isBefore(expiration)){
            return true;
          } else {
            return { error: 'token has expired' };
          }
        }
      }
    }
  }
});
