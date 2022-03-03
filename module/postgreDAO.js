const client = require("../module/connectClient.js");
const {DBInfo, DBUtil} = require("../module/databaseModule");

// API exclusive query

// account.js
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
        '   select * from dungeonus_schema.login ' +
        '       where id = $1 and pw = $2 ' +
        ')' +
        'update dungeonus_schema.login ' +
        'set pw = $3 where id = (select id from exist_id); ';
    const values = [id, curpw, aftpw];

    return client.query(text, values);
}

// profile.js
module.exports.updateProfile = (id, profile)=>{
    const text = 'with update_prof as (' +
        'select * from dungeonus_schema.profile ' +
        '   where id = $8' +
        ')' +
        'update dungeonus_schema.profile ' + 
        'set name=$1, generation=$2, course=$3,' +
        'introduction=$4, github_link=$5, youtube_link=$6,' +
        'insta_link=$7 WHERE id = (select id from update_prof)';
    const values = [profile.name, profile.generation, profile.course, profile.introduction,
        profile.github_link, profile.youtube_link, profile.insta_link, id];

    return client.query(text, values);
}