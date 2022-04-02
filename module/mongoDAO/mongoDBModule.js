const DBInfo = {
    mongoClusterName : "dungeonus-cluster",
    mongoServerIP : 'localhost',
    mongoServerPort : '27017',
    mongoDatabases : {
        sessionDB : {
            dbName : "session-store",
            collectionName : "sessions",
        },
        logDB : {
            dbName : "log-store",
            collectionName : "logs",
        }
    },
}

module.exports = { DBInfo };