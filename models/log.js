var mongoose = require('mongoose');

//Define Log Schema 
var LogSchema = new mongoose.Schema({
    time: String,
    host: String,
    path: String,
    code: String 
});

//Define Log Model
mongoose.model('Log', LogSchema);


//Define Connection Method
exports.createConnection = function(url) {
    return mongoose.createConnection(url);
};

