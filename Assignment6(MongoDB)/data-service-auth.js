const mongoose = require("mongoose");
const bcrypt = require('bcryptjs'); // use bcryptjs module 
const Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }] 
});

let User; // to be defined on new connection 

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection("mongodb://mlab_dbuser:web322@ds221148.mlab.com:21148/web322_a6");

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
// Assume userData has properties: .userName, userAgent, .email, 
// .password, .password2
    return new Promise ((resolve, reject) => {
        if(userData.password !== userData.password2){
            reject("Passwords do not match");
        } else {
            bcrypt.genSalt(10, function(err, salt){
                // generate a "salt" using 10 rounds
                bcrypt.hash(userData.password, salt, function(err, hash){
                    // encrypt the password: userData.password
                    if(err){
                        reject("There was an error encrypting the password");
                    }
                    else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if(err){
                                if(err.code == 11000){
                                    reject("User Name already taken");
                                }
                                reject("There was an error creating the user: " + err);
                            }
                            else{
                                resolve();
                            }
                        })
                    }
                })
                
            })
        }     
    });
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName})
        .exec().then((users) => {
            if(users[0].length == 0){
                reject("Unable to find user: " + userData.userName);
            }
            else {
                bcrypt.compare(userData.password, users[0].password).then((res) => {
                    if(res === true) // it matches
                    {
                        users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                        User.update(
                            { userName: users[0].userName },
                            { $set: {loginHistory: users[0].loginHistory }},
                            { multi: false }
                        ).exec().then((() => {
                            resolve(users[0]);
                        })).catch((err) => {
                            reject("There was an error verifying the user: " + err);
                        });
                    }
                    else {
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                }).catch(() => {
                    reject("Unable to find user: " + userData.userName);
                })
            }
        });
        });
}

