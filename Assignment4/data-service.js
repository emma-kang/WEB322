var fs = require('fs');

// global object 
global.employees = [];
global.departments = [];

// ** module.exports. To use the function in the server.js 
module.exports.initialize = function(){
    return new Promise((resolve, reject) => {
        fs.readFile('./data/employees.json', 'utf-8', (err, data)=>{
            if(err){
                reject("unable to read employees file");
            }
            else{ // if there's no error 
                employees = JSON.parse(data); // the data will store into the employees 
                fs.readFile('./data/departments.json', 'utf-8', (err, data)=>{
                if(err){
                    reject("unable to read department file");
                }
                else{
                    departments = JSON.parse(data);
                    resolve("Success");
                }
              });
            }   
        });
    });
};

module.exports.getAllEmployees = function(){
    return new Promise((resolve, reject)=>{
        if(employees.length == 0){
            reject("No results returned");
        }
        resolve(employees);

    });
};

module.exports.getManagers = function(){
    return new Promise((resolve, reject)=>{
        var managers = []; // to store data which has manager value 
        for(var i=0; i<employees.length; i++){
            if(employees[i].isManager == true){
                managers.push(employees[i]);
            }
        }
        if(managers.length == 0){
            reject("No results returned");
        }
        else{
            resolve(managers);
        }
    });
};

module.exports.getDepartments = function(){
    return new Promise((resolve, reject)=>{
        if(departments.length == 0){
            reject("No results returned");
        }
        else{
            resolve(departments);
        }
    });
};

module.exports.addEmployee = function(employeeData){
    return new Promise((resolve, reject)=>{

        if(employeeData.length == 0){
            reject("No returned employee data");
        }
        else{
            if(employeeData.isManager){
                employeeData.isManager = true;
            }
            else employeeData.isManager = false;
    
            employeeData.employeeNum = employees.length+1;

            employees.push(employeeData);

            resolve(employees); 

        }
    });
}

module.exports.getEmployeesByStatus = function(status){
    return new Promise((resolve, reject) =>{
        var statusArr = [];
       
        for(var i=0; i<employees.length; i++){
            if(employees[i].status == status){
            statusArr.push(employees[i]);
            }
        }
        
        if(statusArr.length == 0){
            reject("No result returned");
        }
        else{
            resolve(statusArr);
        }

    });
};

module.exports.getEmployeesByDepartment = function(department){
    return new Promise ((resolve, reject)=>{
        var departArr = [];
        
        for(var i=0; i<employees.length; i++){
            if(employees[i].department == department){
                departArr.push(employees[i]);
            }
        }

        if(departArr.length == 0){
            reject("No result returned");
        }
        
        resolve(departArr);

    })

};

module.exports.getEmployeesByManager = function(mgr){
    return new Promise ((resolve, reject)=>{
        var mgrArr = [];

        for(var i=0; i<employees.length; i++){
            if(employees[i].employeeManagerNum == mgr){
                mgrArr.push(employees[i]);
            }
        }

        if(mgrArr.length == 0){
            reject("No result returned")
        }
        else{
            resolve(mgrArr);
        }
    })
};

module.exports.getEmployeeByNum = function(num){
    return new Promise ((resolve, reject) =>{
        //var emp;
      
        for(var i=0; i<employees.length; i++){
            if(employees[i].employeeNum == num){
                //emp.push(employees[i]);
                resolve(employees[i]);
            }
        }

        if(employees.length == 0){
            reject("No results returned");
        }

        //resolve(emp);
        
    })
};

module.exports.updateEmployee = function(empData){
    return new Promise ((resolve, reject)=>{
        for(var i=0; i < employees.length; i++){
            if(employees[i].employeeNum == empData.employeeNum){
                employees[i] = empData;     
            }
        }
        if(employees.length == 0){
            reject("No results returned");
        }
        resolve();
    })
};