Tokenizer = {
  generate: function(params){
    var tokenRecord = {
      token: Random.secret(),
      address: params.user.emails[0].address,
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
    var user;
    var tokenRecord;
    var interval;
    var quantity;
    var expiration;
    var now;

    if (Meteor.isServer) {
      user = Meteor.users.findOne({
        'services.email.verificationTokens.token': token
      });
      console.log('user', user)

      if (user) {
        tokenRecord = _.find(user.services.email.verificationTokens, function(tokenObj){
          return tokenObj.token = token;
        });
        console.log('token Record', tokenRecord)
        console.log('token', tokenRecord.token)

        if (tokenRecord && tokenRecord.expires) {
          interval = Object.keys(tokenRecord.expires)[0];
          quantity = tokenRecord.expires[interval];

          expiration = moment(tokenRecord.when).add(quantity, interval);
          now = moment();
          console.log('now', now)
          console.log('expiration', expiration)
          console.log(now.isBefore(expiration))

          if (now.isBefore(expiration)) {
            return true;
          } else {
            //return true;
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
