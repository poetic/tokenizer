Tokenizer = {

  generate: function(params, callback){

    var tokenRecord = {
      token: Random.secret(),
      when: new Date(),
      expires: params.expires
    };
    
    Meteor.call('saveTokenToUser', params.user._id, tokenRecord, function(err, token){
      if(callback) return callback(token);
    });
  },

  verify: function(token, callback){
    Meteor.call('verifyToken', token, function(err, user){
      if (err) { 
        return callback(err) 
      }
      else{
        console.log("valid token :)");
      }

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

    //check(token, String);

    var result = {};
    var user, tokenRecord, interval, quantity, expiration, now;

    if (Meteor.isServer) {

      user = Meteor.users.findOne({
          'services.email.verificationTokens.token': token
      });

      if (user) {

        console.log("there was a token found");

          tokenRecord = _.find(user.services.email.verificationTokens, function(tokenObj){
              return tokenObj.token === token;
          });

          if (tokenRecord && tokenRecord.expires) {

              interval = Object.keys(tokenRecord.expires)[0];
              quantity = tokenRecord.expires[interval];

              tokenExpires = moment(tokenRecord.when).add(quantity, interval);
              now = moment();

              if (now.isBefore(tokenExpires)) {
                //return true
                return user;
              }
              else{
                throw new Meteor.Error('token has expired');
              }
          }
          // token does not have an expiration date
          else if(tokenRecord){
              //return true;
              return user;
          }
          // couldn't find token for user
          else{
              throw new Meteor.Error('token not found for this user')
          }
      }
      else{
        throw new Meteor.Error('token not found for this user')
      }

    }

  }

});

if (Meteor.isServer) {
  Meteor.methods({
    saveTokenToUser: function(userId, tokenRecord, callback){
      Meteor.users.update(
        {_id: userId},
        {$push: {'services.email.verificationTokens': tokenRecord}}
      );
      return tokenRecord.token;
    },
  });
}

