const multer = require('multer');
const { type } = require('os');
const path = require('path')

const generateRoutes = (app, passport, User, data, fs) => {

    //middlewares
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/login");
    }

    function isAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user.isAdmin) {
            return next();
        } else {
            res.redirect("/");
            console.log('You are not an administrator')
        }
    }

    function generateUniqueId(someData) {
        var someId = someData.length + 1;
        return someId;
    }
    
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/assets/images')
        },
        filename: (req, file, cb) => {
            console.log(file)
            cb(null, Date.now() + '-' + file.originalname)
        }
    })

    const upload = multer({
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 5 } // 5 MB limit
    });
    app.use(upload.fields([{ name: 'image', maxCount: 1 }, { name: 'cssImage', maxCount: 1 }]));

    app.get('/', function (req, res) {
        res.render('index', { currentUser: req.user, data: data.countries });
    });

    app.get('/editCountry/:type/:id', (req, res) => {
        const type = req.params.type;
        const id = parseInt(req.params.id);
        const countryToEdit = data.countries.find(country => country.id === id)
        res.render('edit', { type: type, currentUser: req.user, country: countryToEdit })
    })

    app.get('/auth/google', passport.authenticate('google', {
        scope: ['email', 'profile']
    }))

    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }))

    app.get('/register', function (req, res) {
        res.render('register', { currentUser: req.user });
    });

    app.get('/login', function (req, res) {
        res.render('login', { currentUser: req.user });
    });

    app.get('/deals', function (req, res) {
        res.render('deals', { currentUser: req.user, data: data.deals });
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
        
        res.render('deals', { currentUser: req.user, data: filteredDeals })

    })

    app.get('/reservation', isLoggedIn, function (req, res) {
        res.render('reservation', { currentUser: req.user });
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

    app.get('/admin', isAdmin, (req, res) => {
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
            new User({ username: req.body.username, email: req.body.email, isAdmin: false }),
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

    app.post("/createAdmin", function (req, res) {
        User.register(
            new User({ username: req.body.username, email: req.body.email, isAdmin: true }),
            req.body.password,
            function (err, user) {
                if (err) {
                    console.log(err);
                    res.redirect("/register");
                } else {
                    passport.authenticate("local")(req, res, function () {
                        console.log(req.user)
                        res.redirect("/admin");
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
        const countryName = req.body.countryName,
            desc = req.body.desc,
            desc2 = req.body.desc2,
            population = req.body.population,
            territory = req.body.territory,
            avgPrice = req.body.avgPrice,
            image = `/assets/images/${req.files.image[0].filename}`,
            continent = req.body.continent,
            cssImage = `/assets/images/${req.files.cssImage[0].filename}`;

        const newContent = {
            "id": generateUniqueId(data.countries), // Implement a function to generate a unique ID
            "name": countryName,
            "desc": desc,
            "desc2": desc2,
            "population": population,
            "territory": territory,
            "avgPrice": avgPrice,
            "image": image,
            "continent": continent,
            "css": {
                "background": cssImage,
                "blur": cssImage
            },
            "cities": []
        };
        data.countries.push(newContent);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/admin');
    });

    app.post('/addCity', (req, res) => {
        const countryName = req.body.country,
            city = req.body.cityName,
            image = `/assets/images/${req.files.image[0].filename}`,
            checkIns = req.body.checkIns,
            price = req.body.price,
            secImage = `/assets/images/${req.files.cssImage[0].filename}`;
        const cityToUpdate = data.countries.find(country => country.name === countryName).cities;
        const newCity = {
            "id": generateUniqueId(cityToUpdate),
            "name": city,
            "image": image,
            "checkIns": checkIns,
            "price": price,
            "offers": {
                "image": secImage
            }
        }
        data.countries.find(country => country.name === countryName).cities.push(newCity);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/admin');
    })
    
    app.post('/addDeal', (req, res) => {
        const city = req.body.cityName,
            image = `/assets/images/${req.files.image[0].filename}`,
            desc = req.body.desc,
            duration = req.body.duration,
            location = req.body.location,
            type = req.body.type,
            price = req.body.price
        const newDeal = {
            "id": generateUniqueId(data.deals),
            "cityName": city,
            "desc": desc,
            "type": type,
            "duration": duration,
            "location": location,
            "image": image,
            "price": price,
        }
        data.deals.push(newDeal);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/admin');
    })

    // Handle form submission to delete a country
    app.post('/deleteCountry', (req, res) => {
        const countryId = parseInt(req.body.countryId);
        data.countries = data.countries.filter(country => country.id !== countryId);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/admin');
    });

    // Handle form submission to delete a deal
    app.post('/deleteDeal', (req, res) => {
        const dealId = parseInt(req.body.dealId);
        data.deals = data.deals.filter(deal => deal.id !== dealId);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/admin');
    });

    //put routes
    app.post('/editCountry/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const countryToUpdate = data.countries.find(country => country.id === id);

    const countryName = req.body.countryName,
        desc = req.body.desc,
        desc2 = req.body.desc2,
        population = req.body.population,
        territory = req.body.territory,
        avgPrice = req.body.avgPrice,
        image = `/assets/images/${req.files.image[0].filename}`,
        continent = req.body.continent,
        cssImage = `/assets/images/${req.files.cssImage[0].filename}`;

    const newContent = {
        "id": countryToUpdate.id,
        "name": countryName,
        "desc": desc,
        "desc2": desc2,
        "population": population,
        "territory": territory,
        "avgPrice": avgPrice,
        "image": image,
        "continent": continent,
        "css": {
            "background": cssImage,
            "blur": cssImage
        },
        "cities": countryToUpdate.cities
    };

    if (countryToUpdate) {
        Object.assign(countryToUpdate, newContent);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/admin');
    } else {
        res.status(404).json({ success: false, message: 'Country not found' });
    }
});

}
module.exports = generateRoutes;
