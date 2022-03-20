const client = require("./Client");
const {DBInfo, DBUtil} = require("./postgresDBModule");

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
    '       values($1, $2)' +
    ')' +
    'insert into ' + DBUtil.profileTable +
    '   values($1, $3, $4);';
    const values = [id, pw, name, gen];
    
    return client.query(text, values);
}

module.exports.selectAllAcnt = ()=>{
    const text = 'select * from ' + DBUtil.profileTable + '';
    const values = [];

    return client.query(text, values);
}

module.exports.updateLogin = (id, curpw, aftpw) =>{
    const text = 'with exist_id as ( ' +
        '   select * from ' + DBUtil.loginTable +
        '       where id = $1 and pw = $2 ' +
        ')' +
        'update '+ DBUtil.loginTable +
        '   set pw = $3 where id = (select id from exist_id); ';
    const values = [id, curpw, aftpw];

    return client.query(text, values);
}

module.exports.selectLoginWithId = (id)=>{
    const text = 'select * from ' + DBUtil.loginTable + ' where id = $1';
    const values = [id];

    return client.query(text, values);
}