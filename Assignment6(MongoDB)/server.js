
var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
const exphbs = require('express-handlebars'); // to use express-handlebars module 
var app = express();
const path = require('path'); // to use 'path'
const multer = require('multer'); // middleware multer 
var fs = require('fs'); // file system module 
const bodyParser = require('body-parser'); // middleware body-parser
const data_service = require('./data-service.js'); // use data-service.js file  
const dataServiceAuth = require('./data-service-auth.js'); // use data-service-auth.js file
const clientSessions = require('client-sessions'); // use client-sessions middleware



// server needs to know how to handle HTML files that are formatted using handlebars
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        // we write the filename as the current date down to the millisecond
        // in a large web service this would possibly cause a problem if two people
        // uploaded an image at the exact same time. A better way would be to use GUID's for filename
        // this is a simple example. 
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
// tell multer to use the diskStorage function for naming files instead of the default
const upload = multer({ storage: storage });

// set up the public folder that static resources can load from 
app.use(express.static('./public'));

// set up client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "web322_assignment6",
    duration: 2 * 60 * 1000, // duration of the session in milliseconds(2min)
    activeDuration: 1000 * 60 // the session will be extended by this may ms each request
}));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// custom middleware function to ensure that all of templates will 
// have access to a "session" object
app.use((req,res,next) => {
    res.locals.session = req.session;
    next();
})

// This will add the property "activeRoute" to "app.locals" whenever the route changes
// ie: if "/employees/add", the app.locals.activeRoute value will be "/employees/add"
app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// A helper middleware function 
// that checks if a user is logged in 
// this function can be used in any route we want to protect against 
// unauthenticated access.
let ensureLogin = (req, res, next) => {
    if(!req.session.user){
        res.redirect("/login");
    } else {
        next();
    }
};

//////////////////////////////////////////////////////////////////////////////////////////
// Routes ///////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

// Login
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    // must set the value of client's "User-Agent" to the request body
    req.body.userAgent = req.get('User-Agent');

    dataServiceAuth.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }

        res.redirect('/employees');

    }).catch((err) => {
        res.render('login', {errorMessage: err, userName: req.body.userName});
    });
});

// Logout
app.get('/logout', (req, res) => {
    // reset the session
    req.session.reset();
    res.redirect('/');
});

// Register 
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    dataServiceAuth.registerUser(req.body)
    .then((value) => {
        res.render('register', {successMessage: "User created"});
    }).catch((err) => {
        res.render('register', {errorMessage: err, userName: req.body.userName});
    })
});

// User History 
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
})

// For image
app.get('/images/add', ensureLogin, (req, res) => {
    res.render('addImage');
});

app.post('/images/add', upload.single('imageFile'), ensureLogin, (req, res) => {
    res.redirect('/images');
})

app.get('/images', ensureLogin, (req, res) => {
    var img = {
        images: []
    };
    fs.readdir('./public/images/uploaded/', function (err, items) {
        //    for (var i=0; i<items.length; i++){
        //        img += JSON.stringify(items[i]);
        //    }
        for (var i = 0; i < items.length; i++) {
            img.images.push(items[i]);
        }
        //res.json(img);
        res.render('images', { data: img.images });
    });
});

// For Employees 
app.get('/employees', ensureLogin, (req,res) => {
    // To use 'getAllEmployees' function in data_service.js 

    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status).then(function (value) {
            if (value.length > 0) {
                res.render('employees', { employees: value });
            }
        }).catch(function (err) {
            res.render('employees', { message: "no results" });
        });
    }
    else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager).then(function (value) {
            if (value.length > 0) {
                res.render('employees', { employees: value });
            }
        }).catch(function (err) {
            res.render('employees', { message: "no results" });
        })
    }
    else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department).then(function (value) {
            res.render('employees', { employees: value });
            
        }).catch(function (err) {
            res.render('employees', { message: "no result" });
        });
    }
    else {
        data_service.getAllEmployees().then(function (value) {
            res.render('employees', { employees: value });
        }).catch((err) => { // when promise failed 
            res.render('employees', { message: "no results" });
        })
    }
});

app.get('/employees/add', ensureLogin, (req, res) => {
    data_service.getDepartments().then(value => {
        res.render("addEmployee", { departments: value });
    }).catch(value => {
        res.render("addEmployee", { departments: [] });
    })
});

app.post('/employees/add', ensureLogin, (req, res) => {
    data_service.addEmployee(req.body).then(function (value) {
        res.redirect('/employees');

    }).catch((err) => {
        res.send(err);
    });
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data_service.getEmployeeByNum(req.params.empNum).then((data) => {
        viewData.data = data; //store employee data in the "viewData" object as "data"
    }).catch(() => {
        viewData.data = null; // set employee to null if there was an error
    }).then(data_service.getDepartments).then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
                                     // loop through viewData.departments and once we have found the departmentId that matches
                                     // the employee's "department" value, add a "selected" property to the matching
                                     // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.data[0].department) {
                viewData.departments[i].selected = true;
            }
        }
        // if not add department set Selected to false and promto a message to user, message like "Please Choose Department" in html.
        if (viewData.departments[viewData.departments.length-1].departmentId != viewData.data[0].department) {
            viewData.departments.Selected = false;
        }
    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.data == null){ // if no employee - return an error
            res.status(404).send("Employee Not Found!!!");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});

app.post("/employee/update", ensureLogin, (req, res) => {
    data_service.updateEmployee(req.body).then(function () {
        res.redirect('/employees');
    }).catch((err) => {
        res.send(err);
    })
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    data_service.deleteEmployeeByNum(req.params.empNum).then(function(){
        res.redirect('/employees');
    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    })

});

// Departments 
app.get('/departments', ensureLogin, (req, res) => {
    data_service.getDepartments().then(function (value) {
        if(value.length > 0){
            res.render('departments', { departments: value });
        }
    }).catch((err) => {
        res.render('departments', { message: "no result" });
    });
});

app.get('/departments/add', ensureLogin, (req, res) => {
    res.render('addDepartment');
});

app.post('/departments/add', ensureLogin, (req, res) => {
    data_service.addDepartment(req.body).then(function (value) {
        res.redirect('/departments');

    }).catch((err) => {
        res.send(err);
    });
});

app.post('/department/update', ensureLogin, (req, res) => {
    data_service.updateDepartmnet(req.body).then(function () {
        res.redirect('/departments');
    }).catch((err) => {
        res.send(err);
    })
});

app.get('/department/:departmentId', ensureLogin, (req, res) => {
    data_service.getDepartmentById(req.params.departmentId).then(function (value) {
        res.render('department', { department: value });
    }).catch(function (err) {
        res.status(404).send("Department Not Found");
    });
});

app.get('*', (req, res) => {
    res.status(404).send("Page Not Found");
});


dataServiceAuth.initialize()
.then(dataServiceAuth.initialize)
.then(()=>{
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch((err)=>{
    console.log("unable to start server: " + err);
})




