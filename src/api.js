require('dotenv').config();

var Promise = require('es6-promise').Promise;
var tumblr = require('tumblr.js');

function api(token, secret) {

  this.client = new tumblr.Client({
    credentials: {
      consumer_key: process.env.TUMBLR_API_KEY,
      consumer_secret: process.env.TUMBLR_API_SECRET,
      token: token,
      token_secret: secret
    },
    returnPromises: true
  });

  this.getUserInfo = function() {
    return new Promise(function(resolve, reject) {
      this.client.userInfo().then(function(result){
        resolve(result);
      })
    }.bind(this));
  }

  return this;

}

module.exports = api;
