const client = require("../connectClient.js");
const {DBInfo, DBUtil} = require("../databaseModule");

// searchDAO.js
module.exports.selectAllPostings = (id) => {
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        ')' + 
        'select dungeonus_schema.posting' + 
        '   where id = (select id from checkid);';
    const values = [id];

    return client.query(text, values);
}

module.exports.selectAllComments = (id )=>{
    const text = 'with checkid as (' +
        'select * from dungeonus_schema.login' +
        '   where id = $1' + 
        ')' + 
        'select dungeonus_schema.comment' + 
        '   where id = (select id from checkid);';
    const values = [id];

    return client.query(text, values);
}