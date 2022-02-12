const mongoose = require('mongoose');
const accountInfo = require('../accountData/mongodbAccountInfo');
const { DBInfo } = require('./mongoDBModule');

const connect = () => {
    mongoose.connect('mongodb+srv://'
    +accountInfo.user+':'
    +accountInfo.password+'@'
    + DBInfo.mongoClusterName +'.2wk2k.mongodb.net/'
    + DBInfo.mongoDatabases.sessionDB.dbName +'?retryWrites=true&w=majority', function (err) {
        if (err) {
            console.error('mongodb connection error', err);
        }
        console.log('mongodb connected');
    });
}

connect();

const sessionSchema = new mongoose.Schema({
    _id: String,
    expires: Date,
    session: String,
})

const SessionModel =  mongoose.model("session", sessionSchema);

module.exports = SessionModel;