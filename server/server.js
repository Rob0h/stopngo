var express = require('express');
var app = express();
var morgan = require('morgan');

app.use(morgan('dev'));

require('./request-handler.js')(app, express);

app.listen(3000, function () {
  console.log('Server is listening at port 3000');
})