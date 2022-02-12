const DBInfo = {
    mongoClusterName : "dungeonus-cluster",
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

module.exports = {DBInfo};