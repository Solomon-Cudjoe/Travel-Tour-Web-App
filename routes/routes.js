const generateRoutes = (app, passport, User) => {

    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/register', function (req, res) {
        res.render('register');
    });

    app.get('/login', function (req, res) {
        res.render('login');
    });

    app.get('/deals', function (req, res) {
        res.render('deals');
    });

    app.get('/reservation', isLoggedIn, function (req, res) {
        res.render('reservation');
    });

    app.get('/caribbean', function (req, res) {
        res.render('about');
    });

    app.get('/france', function (req, res) { 
        res.render('france');
    });

    app.get('/switzerland', function (req, res) { 
        res.render('switzerland');
    });

    app.get('/thailand', function (req, res) {
        res.send('This would be the thailand page');
    })

    app.get("/logout", function (req, res) {
        req.logout(
            function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/");
                }
            }
        );
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/login");
    }

    //post routes
    app.post("/register", function (req, res) {
        User.register(
            new User({ username: req.body.username, email: req.body.email }),
            req.body.password,
            function (err, user) {
                if (err) {
                    console.log(err);
                    res.redirect("/register");
                } else {
                    passport.authenticate("local")(req, res, function () {
                        res.redirect("/");
                    });
                }
            })
    })

    app.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
    }))
};

module.exports = generateRoutes;
