const MongoStore = require('connect-mongo');
const accountInfo = require('../../accountData/mongodbAccountInfo');
const { DBInfo } = require('./mongoDBModule');

const mongoStore = MongoStore.create({
    mongoUrl: 'mongodb+srv://'
        +accountInfo.user+':'
        +accountInfo.password+'@'
        + DBInfo.mongoClusterName +'.2wk2k.mongodb.net/'
        + DBInfo.mongoDatabases.sessionDB.dbName +'?retryWrites=true&w=majority',
    autoRemove: 'interval',
    ttl: 3600,
});

module.exports = mongoStore;