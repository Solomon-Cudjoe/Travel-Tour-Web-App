const generateRoutes = (app, passport, User, data, fs) => {

    app.get('/', function (req, res) {
        res.render('index', {currentUser: req.user,  data: data.countries});
    });

    app.get('/register', function (req, res) {
        res.render('register', {currentUser: req.user});
    });

    app.get('/login', function (req, res) {
        res.render('login', {currentUser: req.user});
    });

    app.get('/deals', function (req, res) {
        res.render('deals', {currentUser: req.user, data: data.deals} );
    });

    app.get('/filter', function (req, res) {
        const location = req.query.location
        const minPrice = req.query.minPrice
        const maxPrice = req.query.maxPrice

        const filteredDeals = data.deals.filter(deal => {
            return (
                !location || deal.location === location) && (
                    (!minPrice || !maxPrice) || (deal.price >= parseInt(minPrice) && deal.price <= parseInt(maxPrice)));
        });
        console.log(filteredDeals)
        
        res.render('deals', {currentUser: req.user, data: filteredDeals})

    })

    app.get('/reservation', isLoggedIn, function (req, res) {
        res.render('reservation', {currentUser: req.user});
    });

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

    app.get('/admin', (req, res) => {
        res.render('admin', { data, currentUser: req.user });
    });

    app.get('/:countryName', (req, res) => {
    const countryName = req.params.countryName;
    const country = data.countries.find(country => country.name === countryName);
        if (country) {
        res.render('about', { country, currentUser: req.user });
    } else {
        res.redirect('/');
    }
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



    // Handle form submission to add content
    app.post('/addContent', (req, res) => {
        const countryName = req.body.countryName;
        const newContent = {
            "id": generateUniqueId(), // Implement a function to generate a unique ID
            "name": countryName,
            // Set other properties based on form input
        };

        // Add the new content to the JSON data
        data.countries.push(newContent);

        // Save the updated JSON data to the file (add error handling)
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

        res.redirect('/admin');
    });

    // Handle form submission to delete a country
    app.post('/deleteCountry', (req, res) => {
        const countryId = parseInt(req.body.countryId);
        data.countries = data.countries.filter(country => country.id !== countryId);

        // Save the updated JSON data to the file (add error handling)
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

        res.redirect('/admin');
    });

    // Handle form submission to delete a deal
    app.post('/deleteDeal', (req, res) => {
        const dealId = parseInt(req.body.dealId);
        data.deals = data.deals.filter(deal => deal.id !== dealId);

        // Save the updated JSON data to the file (add error handling)
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

        res.redirect('/admin');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/login");
    }

    function generateUniqueId(someData) {
    var someId
}
};
module.exports = generateRoutes;
