var path = require('path');
var express = require('express');

var app = express();
var cl = require('./cl.js')

app.use('/static', express.static(path.join(__dirname,'..','/static/')));

app.use(express.bodyParser());

cl(app).listen(7080);

console.log('server start on 7080')