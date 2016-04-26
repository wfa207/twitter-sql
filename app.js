var express = require( 'express' );
var app = express(); // creates an instance of an express application

app.use(function(req,res,next) {
  console.log(req.method+" "+req.url);
  next();
  console.log("Eventual status code");
})

var server = app.listen(3000, function() {
  console.log("Port up and running!");
})