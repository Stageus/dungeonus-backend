const client = require("../connectClient.js");
const {DBInfo, DBUtil} = require("../databaseModule");

// searchDAO.js
module.exports.selectAllPostings = (id) => {
    const text = 'with checkid as (' + 
        'select * from ' + DBUtil.loginTable + 
        '   where id = $1' + 
        ')' + 
        'select ' + DBUtil.postingTable + 
        '   where id = (select id from checkid);';
    const values = [id];

    return client.query(text, values);
}

module.exports.selectAllComments = (id )=>{
    const text = 'with checkid as (' +
        'select * from ' + DBUtil.loginTable +
        '   where id = $1' + 
        ')' + 
        'select ' + DBUtil.commentTable + 
        '   where id = (select id from checkid);';
    const values = [id];

    return client.query(text, values);
}