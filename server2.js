var express = require('express');
var app = express();
var path = require('path');
var morgan = require('morgan');

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname + '/app')));
console.log(__dirname + '/app');
require('./request-handler.js')(app, express);

app.listen(3000, function () {
  console.log('Server is listening at port 3000');
})