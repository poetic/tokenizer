# tokenizer

A Meteor package that allows you to set tokens on users with arbitrary expiration dates

## Installation

`meteor add poetic:tokenizer`

## Usage

#### Tokenizer#generate

```
var token = Tokenizer.generate({
  user: user,
  expires: { minutes: 5 }
})
```

`user` is a `Meteor.user`. Expires is an optional object in the form of `{ interval: quantity }`. Tokens that are generated without an `expires` object will have no expiration date. Interval can be any duration recoginzed by momentjs's [`moment().add`](http://momentjs.com/docs/#/manipulating/add/).
Returns the token as a string.

#### Tokenizer#verify

```
Tokenizer.verify(token, function(err, result){
  if (! err) {
    // token is valid; result is the value true
  } else {
    // token is invalid; err is Meteor.Error object
  }
});
```

All tokens are one time use. Once a token is validated it is removed from the user's tokens array.
