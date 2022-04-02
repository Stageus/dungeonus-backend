const mongoose = require('mongoose');
const accountInfo = require('../../accountData/mongodbAccountInfo');
const { DBInfo } = require('./mongoDBModule');

const connect = () => {
    return mongoose.createConnection('mongodb://'
    +accountInfo.user+':'
    +accountInfo.password+'@'
    + DBInfo.mongoServerIP + ':' + DBInfo.mongoServerPort
    + '/' + DBInfo.mongoDatabases.sessionDB.dbName
    , function (err) {
        if (err) {
            console.error('mongodb connection error', err);
        }
        console.log('mongodb sessionDB connected');
    });
}

const sessionConn = connect();

const sessionSchema = new mongoose.Schema({
    _id: String,
    expires: Date,
    session: String,
})

const SessionModel =  sessionConn.model("session", sessionSchema);

module.exports = SessionModel;