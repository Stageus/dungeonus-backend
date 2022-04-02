const MongoStore = require('connect-mongo');
const accountInfo = require('../../accountData/mongodbAccountInfo');
const { DBInfo } = require('./mongoDBModule');

const mongoStore = MongoStore.create({
    mongoUrl: 'mongodb://'
        +accountInfo.user+':'
        +accountInfo.password+'@'
        + DBInfo.mongoServerIP + ':' + DBInfo.mongoServerPort
        + '/' + DBInfo.mongoDatabases.sessionDB.dbName,
    autoRemove: 'interval',
    ttl: 3600,
});

module.exports = mongoStore;