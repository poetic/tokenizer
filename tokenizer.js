Tokenizer = {
  generate: function(params, callback){
    var email;

    //if (params.user.emails && params.user.emails.length) {
      //email = params.user.emails[0].address;

    //} else {
      //email = '';
    //}

    var tokenRecord = {
      token: Random.secret(),
      address: params.user.emails[0].address,
      when: new Date(),
      expires: params.expires
    };

    Meteor.call('saveTokenToUser', params.user._id, tokenRecord, function(err, token){
      return callback(token);
    });
  },

  verify: function(token, callback){
    Meteor.call('verifyToken', token, function(err, user){
      if (err) { return callback(err) }

      Accounts.verifyEmail(token, function(e){
        if (e) {
          callback(new Error('token is not valid'));
        } else {
          callback(null, user);
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
            return user;
            //return true;
          } else {
            throw new Meteor.Error('token has expired');
          }

          // token does not have an expiration date
        } else if (tokenRecord) {
          return user;
          //return true;

        } else { throw new Meteor.Error('token not found for this user') }

      } else { throw new Meteor.Error('token not found for this user') }
    }
  }
});

if (Meteor.isServer) {
  Meteor.methods({
    saveTokenToUser: function(userId, tokenRecord){
      Meteor.users.update(
        {_id: userId},
        {$push: {'services.email.verificationTokens': tokenRecord}}
      );

      return tokenRecord.token;
    },
  });
}
