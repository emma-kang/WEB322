
var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
const exphbs = require('express-handlebars'); // to use express-handlebars module 
var app = express();
const path = require('path'); // to use 'path'
const em_json = require('./data/employees.json');
const dp_json = require('./data/departments.json');
const multer = require('multer'); // middleware multer 
var fs = require('fs'); // file system module 
const bodyParser = require('body-parser'); // middleware body-parser 
const json = require('res-json');
const data_service = require('./data-service.js'); // use data-service.js file 

// server needs to know how to handle HTML files that are formatted using handlebars
app.engine('.hbs', exphbs({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options){
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    } })); 
app.set('view engine', '.hbs');

// to set the middleware for "urlencoded" form data (normal HTTP Post data)
app.use(bodyParser.urlencoded({ extended: true}));

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb){
        // we write the filename as the current date down to the millisecond
        // in a large web service this would possibly cause a problem if two people
        // uploaded an image at the exact same time. A better way would be to use GUID's for filename
        // this is a simple example. 
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
// tell multer to use the diskStorage function for naming files instead of the default
const upload = multer({ storage: storage });

app.use(express.static('./public'));

// This will add the property "activeRoute" to "app.locals" whenever the route changes
// ie: if "/employees/add", the app.locals.activeRoute value will be "/employees/add"
app.use(function(req, res, next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/,"");
    next();
});

app.get('/', function(req, res){
    //res.sendFile(path.join(__dirname, "/views/home.html"));
    res.render('home');
});

app.get('/about', function(req, res){
    //res.sendFile(path.join(__dirname, "/views/about.html"));
    res.render('about'); 
});

app.get('/employees/add', function(req, res){ 
    //res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
    res.render('addEmployee'); 
});

app.post('/employees/add', function(req, res){
   data_service.addEmployee(req.body).then(function(value){
       res.redirect('/employees');

   }).catch(function(value){
       res.send(value);
   });
});

app.get('/images/add', function(req, res){ 
    //res.sendFile(path.join(__dirname, "/views/addImage.html"));
    res.render('addImage');
});

app.post('/images/add', upload.single('imageFile'), (req, res) => {
    res.redirect('/images');
})

app.get('/images', function(req, res){
    var img = {
        images:[]
    };
    fs.readdir('./public/images/uploaded/', function(err, items){
    //    for (var i=0; i<items.length; i++){
    //        img += JSON.stringify(items[i]);
    //    }
        for(var i=0; i<items.length; i++){
            img.images.push(items[i]);
        }
        //res.json(img);
        res.render('images', {data: img.images});
    });
});

app.get('/employees', function(req, res){
//    var employees = JSON.stringify(em_json);
//    //res.send(employees);
//    res.json(employees);
// To use 'getAllEmployees' function in data_service.js 

if(req.query.status){
    data_service.getEmployeesByStatus(req.query.status).then(function(value){
        //res.json(value);
        res.render('employees', {employees: value});
    }).catch(function(err){
        //res.send(err);
        res.render('employees', {message: "no results"});
    });
}
else if(req.query.manager){
    data_service.getEmployeesByManager(req.query.manager).then(function(value){
        //res.json(value);
        res.render('employees', {employees: value});
    }).catch(function(err){
        //res.send(err);
        res.render('employees', {message: "no results"});
    })
}
else if(req.query.department){
    data_service.getEmployeesByDepartment(req.query.department).then(function(value){
        res.render('employees', {employees: value});
    }).catch(function(err){
        res.render('employees', {message: "no result"});
    })
}
else{
    data_service.getAllEmployees().then(function(value){
    //console.log(value);
    // value is the result of return of Promise 
    // then - success 
    //res.send(value);
    res.render('employees', {employees: value});
}).catch(function(value){ // when promise failed 
    //console.log(value);
    //res.send(value);
    res.render('employees', {message: "no results"});
})}
});

app.get('/employee/:employeeNum', function(req, res){
    data_service.getEmployeeByNum(req.params.employeeNum).then(function(value){
        //res.json(value);
        res.render('employee', {employee: value});
    }).catch(function(err){
        //res.send(err);
        res.render("employee", {message: "no result"});
    });
});

app.get('/departments', function(req, res){
    // var department = JSON.stringify(dp_json);
    // //res.send(department);
    // res.json(department);

    data_service.getDepartments().then(function(value){
       //res.send(value);
       res.render('departments', {departments: value});
    }).catch(function(value){
       res.send(value);
    });

});

app.get('*', (req, res)=>{
    res.status(404).send("Page Not Found");
});

app.post("/employee/update", (req, res) => {
    data_service.updateEmployee(req.body).then(function(){
        res.redirect('/employees');
    }).catch(function(value){
        res.send(value);
    })
});


data_service.initialize().then(function(value){ // resolve (of promise)
    app.listen(HTTP_PORT, function(){
        console.log(`Express http server listening on ${HTTP_PORT}`);
    });
}).catch(function(value){ // reject (of promise)
    console.log(value);
});






