const client = require("./Client");
const {DBInfo, DBUtil} = require("./postgresDBModule");

// profile.js
module.exports.selectProfileWithId = (id) => {
    const text = 'SELECT * FROM ' + DBUtil.profileTable + ' WHERE id=$1';
    const values = [id];

    return client.query(text, values);
}

module.exports.updateProfile = (id, profile)=>{
    const text = 'with update_prof as (' +
        'select * from ' + DBUtil.profileTable +
        '   where id = $8' +
        ')' +
        'update ' + DBUtil.profileTable + 
        '   set name=$1, generation=$2, course=$3,' +
        '   introduction=$4, github_link=$5, youtube_link=$6,' +
        '   insta_link=$7 WHERE id = (select id from update_prof)';
    const values = [profile.name, profile.generation, profile.course, profile.introduction,
        profile.github_link, profile.youtube_link, profile.insta_link, id];

    return client.query(text, values);
}