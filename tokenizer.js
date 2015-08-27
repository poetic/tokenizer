Tokenizer = {
  generate: function(params){
    var email;

    if (params.user.emails && params.user.emails.length) {
      email = params.user.emails[0].address;

    } else {
      email = '';
    }

    var tokenRecord = {
      token: Random.secret(),
      address: email,
      when: new Date(),
      expires: params.expires
    };

    Meteor.users.update(
      {_id: params.user._id},
      {$push: {'services.email.verificationTokens': tokenRecord}}
    );

    return tokenRecord.token;
  },

  verify: function(token, callback){
    Meteor.call('verifyToken', token, function(err, result){
      if (err) { return callback(err) }

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
    check(token, String);

    var result = {};
    var user, tokenRecord, interval, quantity, expiration, now;

    if (Meteor.isServer) {
      user = Meteor.users.findOne({
        'services.email.verificationTokens.token': token
      });

      if (user) {
        tokenRecord = _.find(user.services.email.verificationTokens, function(tokenObj){
          return tokenObj.token === token;
        });

        if (tokenRecord && tokenRecord.expires) {
          interval = Object.keys(tokenRecord.expires)[0];
          quantity = tokenRecord.expires[interval];

          tokenExpires = moment(tokenRecord.when).add(quantity, interval);
          now = moment();

          if (now.isBefore(tokenExpires)) {
            return true;
          } else {
            throw new Meteor.Error('token has expired');
          }

          // token does not have an expiration date
        } else if (tokenRecord) {
          return true;

        } else { throw new Meteor.Error('token not found for this user') }

      } else { throw new Meteor.Error('token not found for this user') }
    }
  }
});
