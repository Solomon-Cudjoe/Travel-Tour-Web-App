var express = require('express');

var app = express();

app.get('/', function (res, req) {
    res.render('index.html');
})

app.get('/register', function (res, req) {
    res.render('register.html');
})

app.get('/login', function (res, req) {
    res.render('login.html');
})

app.get('/deals', function (res, req) {
    res.render('deals.html');
})

app.get('/resevation', function (res, req) {
    res.render('resevation.html');
})

app.get('/caribbean', function (res, req) {
    res.render('about.html');
})

app.get('/france', function (res, req) { 
    res.render('france.html');
})