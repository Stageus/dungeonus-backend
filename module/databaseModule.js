const returnTableFormat = (schemaName, tableName) => {
    let resSting = "";
    resSting += schemaName + "." + tableName;
    return resSting;
};

const DBInfo = {
    database : "dungeonus",
    schema : "dungeonus_schema",
    tables : {
        "loginTable" : "login",
        "profileTable" : "profile",
        "postingTable" : "posting",
        "commentTable": "comment"
    },
};

const DBUtil ={
    returnTableFormat : returnTableFormat,
    loginTable : returnTableFormat(DBInfo.schema, DBInfo.tables.loginTable),
    profileTable : returnTableFormat(DBInfo.schema, DBInfo.tables.profileTable),
    postingTable : returnTableFormat(DBInfo.schema, DBInfo.tables.postingTable),
    commentTable : returnTableFormat(DBInfo.schema, DBInfo.tables.commentTable )
}

module.exports = {DBInfo, DBUtil};
