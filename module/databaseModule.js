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

const returnTableFormat = (schemaName, tableName) => {
    const resSting = "";
    resSting += schemaName + "." + tableName;
    return resSting;
};

module.exports = {DBInfo, DBUtil};