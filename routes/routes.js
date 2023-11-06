const generateRoutes = (app, passport, User) => {

    app.get('/', function (req, res) {
        res.render('index', {currentUser: req.user});
    });

    app.get('/register', function (req, res) {
        res.render('register', {currentUser: req.user});
    });

    app.get('/login', function (req, res) {
        res.render('login', {currentUser: req.user});
    });

    app.get('/deals', function (req, res) {
        res.render('deals', {currentUser: req.user});
    });

    app.get('/reservation', isLoggedIn, function (req, res) {
        res.render('reservation', {currentUser: req.user});
    });

    app.get('/caribbean', function (req, res) {
        res.render('about', {currentUser: req.user});
    });

    app.get('/france', function (req, res) { 
        res.render('france', {currentUser: req.user});
    });

    app.get('/switzerland', function (req, res) { 
        res.render('switzerland', {currentUser: req.user});
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
                        console.log(req.user)
                        res.redirect("/");
                    });
                }
            })
    })

    app.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
    }))

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/login");
    }
};

    

module.exports = generateRoutes;
