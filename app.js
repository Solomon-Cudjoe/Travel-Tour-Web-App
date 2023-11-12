const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require("passport");
const localStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");
const expressSession = require("express-session");
const generateRoutes = require('./routes/routes');
const data = require('./data.json')
const fs = require('fs')
const app = express();
const port = process.env.PORT || 3100;


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
    secret: 'keyboard key',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());


passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

async function main() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/travel");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

main()
    .then(() => {
        generateRoutes(app, passport, User, data, fs);
        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        })
    })
    .catch((err) => {
        console.log('Start Up error: ', err)
    })

module.exports = { app, passport, data, fs };
