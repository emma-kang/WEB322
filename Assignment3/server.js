
var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
var app = express();
const path = require('path'); // to use 'path'
const em_json = require('./data/employees.json');
const dp_json = require('./data/departments.json');
const multer = require('multer'); // middleware multer (assignment 3)
var fs = require('fs'); // file system module 
const bodyParser = require('body-parser'); // middleware body-parser (assignment 3)
const json = require('res-json');
const data_service = require('./data-service.js'); // use data-service.js file 

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

app.use(express.static('./public/css'));


app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get('/about', function(req, res){
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get('/employees/add', function(req, res){ 
    res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.post('/employees/add', function(req, res){
   data_service.addEmployee(req.body).then(function(value){
       res.redirect('/employees');

   }).catch(function(value){
       res.send(value);
   });
});

app.get('/images/add', function(req, res){ // assignment3 step 2
    res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.post('/images/add', upload.single('imageFile'), (req, res) => {
    res.redirect('/images');
})

app.get('/images', function(req, res){
    var img = {
        images: []
    };
    fs.readdir('./public/images/uploaded/', function(err, items){
    //    for (var i=0; i<items.length; i++){
    //        img += JSON.stringify(items[i]);
    //    }
        for(var i=0; i<items.length; i++){
            img.images.push(items[i]);
        }
        res.json(img);
    });
});

app.get('/employees', function(req, res){
//    var employees = JSON.stringify(em_json);
//    //res.send(employees);
//    res.json(employees);
// To use 'getAllEmployees' function in data_service.js 

if(req.query.status){
    data_service.getEmployeesByStatus(req.query.status).then(function(value){
        res.json(value);
    }).catch(function(err){
        res.send(err);
    });
};

if(req.query.department){
    data_service.getEmployeesByDepartment(req.query.department).then(function(value){
        res.json(value);
    }).catch(function(err){
        res.send(err);
    });
};

if(req.query.manager){
    data_service.getEmployeesByManager(req.query.manager).then(function(value){
        res.json(value);
    }).catch(function(err){
        res.send(err);
    })
};

data_service.getAllEmployees().then(function(value){
    //console.log(value);
    // value is the result of return of Promise 
    // then - success 
    res.send(value);
}).catch(function(value){ // when promise failed 
    //console.log(value);
    res.send(value);
});
});

app.get('/employee/:employeeNum', function(req, res){
    data_service.getEmployeeByNum(req.params.employeeNum).then(function(value){
        res.json(value);
    }).catch(function(err){
        res.send(err);
    });
});

app.get('/managers', function(req, res){
    // var manager = [];

    // for(var i=0; i<em_json.length; i++){
    //     if(em_json[i].isManager == true){
    //       manager += JSON.stringify(em_json[i]);
    //     }
    // }
    // res.json(manager);
    data_service.getManagers().then(function(value){
        // console.log(value);
        res.send(value);
    }).catch(function(value){
        // console.log(value);
        res.send(value);
    });

});

app.get('/departments', function(req, res){
    // var department = JSON.stringify(dp_json);
    // //res.send(department);
    // res.json(department);

    data_service.getDepartments().then(function(value){
       res.send(value);
    }).catch(function(value){
       res.send(value);
    });

});

app.get('*', (req, res)=>{
    res.status(404).send("Page Not Found");
});

data_service.initialize().then(function(value){ // resolve (of promise)
    app.listen(HTTP_PORT, function(){
        console.log(`Express http server listening on ${HTTP_PORT}`);
    });
}).catch(function(value){ // reject (of promise)
    console.log(value);
});






