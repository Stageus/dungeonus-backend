const mongoose = require('mongoose');
const accountInfo = require('../accountData/mongodbAccountInfo');
const { DBInfo } = require('./mongoDBModule');

const connect = () => {
    return mongoose.createConnection('mongodb+srv://'
    +accountInfo.user+':'
    +accountInfo.password+'@'
    + DBInfo.mongoClusterName +'.2wk2k.mongodb.net/'
    + DBInfo.mongoDatabases.logDB.dbName +'?retryWrites=true&w=majority', function (err) {
        if (err) {
            console.error('mongodb connection error', err);
        }
        console.log('mongodb logDB connected');
    });
}

const logConn = connect();

const logSchema = new mongoose.Schema({
    log_time: Date,
    user_id: String,
    api_type: String,
    user_ip: String,
    req_data: String,
    res_data: String,
})

const LogModel =  logConn.model("log", logSchema);

module.exports = LogModel;