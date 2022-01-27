const returnTableFormat = (schemaName, tableName) => {
    let resSting = "";
    resSting += schemaName + "." + tableName;
    return resSting;
};

const DBInfo = {
    "database" : "dungeonus",
    "schema" : "dungeonus_schema",
    "tables" : {
        "loginTable" : "login",
        "" : "",
    },
};

const DBUtil ={
    "returnTableFormat" : returnTableFormat,
    "loginTable" : returnTableFormat(DBInfo.schema, DBInfo.tables.loginTable),
    "" : "",
}

module.exports = {DBInfo, DBUtil};