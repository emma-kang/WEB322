// assignment 5 - add sequelize
const Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://nlzavxhcbtnwri:e5c9f12ab3f9c8de81eda6e11666e2851fb33f533f68b10319af9c33798bef07@ec2-23-21-195-249.compute-1.amazonaws.com:5432/dce8khbo5ekn1u', {
    host: 'ec2-23-21-195-249.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions:{
        ssl: true
    }
});
// define data model 
var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use employeeNum as a primary key 
        autoIncrement: true // automatically increment the value 
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define('Department',{
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

// ** module.exports. To use the function in the server.js 
module.exports.initialize = function(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function(Employee){
            resolve();
        }).then(function(Department){
            resolve();
        }).catch(function(){
            reject("unable to sync the database");
        });

    });
};

// Employees 
module.exports.getEmployeesByStatus = function(status){
    return new Promise((resolve, reject) =>{
       sequelize.sync().then(function() {
        resolve(Employee.findAll({
            where: {
                status: status
            }
        }));  
    }).catch(function(){
        reject("No results returned");
    })
});
};

module.exports.getEmployeesByDepartment = function(department){
    return new Promise ((resolve, reject)=>{
       sequelize.sync().then(function(){
           resolve(Employee.findAll({
            where: {
                department: department
            }
        }));
       }).catch(function(){
        reject("No results returned");
       });  
});
};

module.exports.getEmployeesByManager = function(mgr){
    return new Promise ((resolve, reject)=>{
        sequelize.sync().then(function(){
            resolve(Employee.findAll({
                where: {
                    employeeManagerNum: mgr
                }
            }));         
        }).catch(function(){
            reject("No results returned");
        });
});
};

module.exports.getEmployeeByNum = function(num){
    return new Promise ((resolve, reject) =>{
       sequelize.sync().then(function(){   
        resolve(Employee.findAll({
            where: {
                employeeNum: num
            }
           }));     
       }).catch(function(){
        reject("No results returned");
       })
});
};

module.exports.getAllEmployees = function(){
    return new Promise((resolve, reject)=>{
       sequelize.sync().then(function(){
           resolve(Employee.findAll());
       }).catch(function(){
        reject("No results returned");
       });
});
};

module.exports.addEmployee = function(employeeData){
    return new Promise((resolve, reject)=>{
        // ensure the isManager value is explicitly set to boolean
        employeeData.isManager = (employeeData.isManager) ? true : false;
        // Any blank values in employeeData are set to null 
        for(var prop in employeeData){
            if(employeeData[prop] == ""){
                employeeData[prop] = null;
            }
        }
        sequelize.sync().then(function(){
            resolve(Employee.create({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate}));    
            }).catch(function(){
                reject("unable to create employee");
            });
    });
};

module.exports.updateEmployee = function(empData){
    return new Promise ((resolve, reject)=>{
        empData.isManager = (empData.isManager) ? true : false;
        for(var prop in empData){
            if(empData[prop] == ""){
                empData[prop] = null;
            }
        }
        sequelize.sync().then(function(){
            resolve(Employee.update({
                firstName: empData.firstName,
                lastName: empData.lastName,
                email: empData.email,
                SSN: empData.SSN,
                addressStreet: empData.addressStreet,
                addressCity: empData.addressCity,
                addressState: empData.addressState,
                addressPostal: empData.addressPostal,
                maritalStatus: empData.maritalStatus,
                isManager: empData.isManager,
                employeeManagerNum: empData.employeeManagerNum,
                status: empData.status,
                department: empData.department,
                hireDate: empData.hireDate
            }, {
                where: { employeeNum: empData.employeeNum }
            }));
        }).catch(function(){
            reject("unable to update employee");
        });
    });
};

////////
module.exports.getManagers = function(){
    return new Promise((resolve, reject)=>{
       reject();
    });
};
///////

// Departments
module.exports.getDepartments = function(){
    return new Promise((resolve, reject)=>{
        sequelize.sync().then(function(){
            resolve(Department.findAll());
        }).catch(function(){
            reject("No results returned");
        })
    });
};
// Departments(Assignment5) addDepartment function 
module.exports.addDepartment = function(departmentData){
    return new Promise((resolve, reject)=>{
        // Any blank values in departmentData are set to null 
        sequelize.sync().then(function(){
            for(var prop in departmentData){
                if(departmentData[prop] == ""){
                    departmentData[prop] = null;
                }
            }
            Department.create({
                departmentName: departmentData.departmentName
            });
            
            resolve(Department);
            
        }).catch(function(){
            reject("unable to create department");
        });
    })
};

// Departments(Assignment5) updateDepartment function 
module.exports.updateDepartmnet = function(departmentData){
    return new Promise((resolve, reject) => {
        // Any blank values in departmentData are set to null 
        sequelize.sync().then(function(){
            for(var prop in departmentData){
                if(departmentData[prop] == ""){
                    departmentData[prop] = null;
                }
            }
            Department.update({
                departmentName: departmentData.departmentName
            }, { where: {departmentId: departmentData.departmentId}});

            resolve(Department);

        }).catch(function(){
            reject("unable to update department");
        });
    });
};
// Departments(Assignment5) getDepartmentById(id) function
module.exports.getDepartmentById = function(id){
    return new Promise ((resolve, reject) =>{
        sequelize.sync().then(function(){
            resolve(Department.findAll({
             where: {
                 departmentId: id
             }
            }));     
        }).catch(function(){
         reject("No results returned");
        })
 });
}
// to delete employees
module.exports.deleteEmployeeByNum = function(empNum){
    return new Promise((resolve, reject)=>{
        sequelize.sync().then(()=>{
            resolve(Employee.destroy({
                where: {employeeNum: empNum}
            }));
        }).catch(()=>{
            reject("unable to delete employee");
        })

    });
}