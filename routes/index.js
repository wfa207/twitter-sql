'use strict';
var express = require('express');
var router = express.Router();
// var tweetBank = require('../tweetBank');

module.exports = function makeRouterWithSockets (io, client) {
  
  // a reusable function
  
  function respondWithAllTweets (req, res, next){
    client.query('SELECT * FROM tweets, users WHERE users.id=tweets.userid', function (err, result) {
      if (err) console.error(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }

  // here we basically treat the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next) {
    client.query("SELECT * FROM tweets, users WHERE users.id=tweets.userid AND name=$1", [req.params.username], function (err, result) {
      if (err) console.error(err);
      var tweetsForName = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsForName,
        showForm: true,
        username: req.params.username
      });
    });
  });

  router.get('/tweets/:id', function(req, res, next){
    client.query("SELECT * FROM tweets, users WHERE users.id=tweets.userid AND tweets.id=$1", [req.params.id], function(err, result){
      if (err) console.error(err);
      var tweetsWithThatId = result.rows; //tweetBank.find({ id: Number(req.params.id) });
      console.log(tweetsWithThatId);
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsWithThatId // an array of only one element ;-)
      });
    })
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query("SELECT id FROM users WHERE name=$1", [req.body.name], function(err, userid) {

      client.query("INSERT INTO tweets (userid, content) VALUES ($1, $2)", [1, req.body.text], function(err, result){
        var newTweet = result.rows;
        console.log(req.body.text);
        if (err) console.error(err);
        io.sockets.emit('new_tweet', newTweet);
        res.redirect('/');
      });
    });
  });

 /*

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var newTweet = tweetBank.add(req.body.name, req.body.text);
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });
*/
  return router;
}
