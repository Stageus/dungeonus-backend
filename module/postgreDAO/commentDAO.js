const client = require("../connectClient.js");
const {DBInfo, DBUtil} = require("../databaseModule");

// commentDAO.js
module.exports.selectCommentWithPostingIndex = (postingIndex) => {
    const text = 'select * from dungeonus_schema.comment' + 
        '   where posting_index = $1;';
    const values = [postingIndex];

    return client.query(text, values);
}

module.exports.insertComment = (id, postingIndex, content) => {
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from dungeonus_schema.posting' +
        '   where posting_index = $2' +
        ')' +
        'insert into dungeonus_schema.comment' + 
        '   (board_index, posting_index, id, content, date)' + 
        '   values((select board_index from postingExist),' + 
        '   (select posting_index from postingExist),' +
        '   (select id from checkid),' + 
        '   $3, CURRENT_TIMESTAMP);';
    const values = [id, postingIndex, content];
    
    return client.query(text, values);
}

module.exports.updateComment = (id, commentIndex, content) =>{
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '), commentExist as (' + 
        'select * from dungeonus_schema.comment' +
        '   where comment_index = $2' + 
        ')' +
        'update dungeonus_schema.comment' + 
        '   set content = $3' + 
        '   where id = (select id from checkid)'+
        '   and comment_index =' +
        '   (select comment_index from commentExist);';
    const values = [id, commentIndex, content];

    return client.query(text, values);
}

module.exports.deleteComment = (id, commentIndex)=>{
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '), commentExist as (' + 
        'select * from dungeonus_schema.comment' +
        '   where comment_index = $2' + 
        ')' +
        'delete from dungeonus_schema.comment' + 
        '   where id = (select id from checkid)'+
        '   and comment_index ='+
        '   (select comment_index from commentExist);';
    const values = [id, commentIndex];

    return client.query(text, values);
}

module.exports.selectAllComment = ()=>{
    const text = 'select * from dungeonus_schema.comment;';
    const values = [];

    return client.query(text, values);
}

module.exports.idExists = (id) => {
    const text = 'select * from dungeonus_schema.login where id = $1'
    const values = [id]

    return client.query(text, values);
}

module.exports.commentIndexExists = (commentIndex) => {
   const text = 'select * from dungeonus_schema.comment where comment_index = $1'
   const values = [commentIndex]

   return client.query(text, values);
}