const mongoose = require('mongoose');
const accountInfo = require('../accountData/mongodbAccountInfo');
const { DBInfo } = require('./mongoDBModule');

const connect = () => {
    mongoose.connect('mongodb+srv://'
    +accountInfo.user+':'
    +accountInfo.password+'@'
    + DBInfo.mongoClusterName +'.2wk2k.mongodb.net/'
    + DBInfo.mongoDatabases.logDB.dbName +'?retryWrites=true&w=majority', function (err) {
        if (err) {
            console.error('mongodb connection error', err);
        }
        console.log('mongodb connected');
    });
}

connect();

const logSchema = new mongoose.Schema({
    userId: String,
    time: Date,
})

const LogModel =  mongoose.model("log", logSchema);

module.exports = LogModel;