const client = require("../module/connectClient.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");

// API exclusive query
module.exports.deleteLoginProfileWithId = (id) =>{
    const text = 'with common_id as (' +
        'select L.id from ' + DBUtil.loginTable + ' as L ' +
        '   inner join ' + DBUtil.profileTable + ' as P ' +
        '   on L.id = P.id' +
        '   where L.id = $1' +
        ')' +
        'delete from '+ DBUtil.loginTable +
        '   where id = (select id from common_id);';
    const values = [id];

    return client.query(text, values);
}

module.exports.insertLoginProfile = (id, name, gen, pw) =>{
    const text = 'with insert_acc as (' + 
        '   insert into ' + DBUtil.loginTable + 
        '       values($1, $2, $3)' +
        ')' +
        'insert into ' + DBUtil.profileTable +
        '   values($1, $3, $4);';
    const values = [id, pw, name, gen];

    return client.query(text, values);
}