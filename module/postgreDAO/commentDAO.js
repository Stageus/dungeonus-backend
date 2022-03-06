const client = require("../connectClient.js");
const {DBInfo, DBUtil} = require("../databaseModule");

// commentDAO.js
module.exports.selectCommentWithPostingIndex = (postingIndex) => {
    const text = 'select * from dungeonus_schema.posting' + 
        '   where posting_index = $1;';
    const values = [postingIndex];

    return client.query(text, values);
}

module.exports.insertComment = (id, boardIndex, postingIndex, content) => {
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from dungeonus_schema.posting' +
        '   where posting_index = $3' + 
        ')' +
        'insert into dungeonus_schema.comment' + 
        '   (id, board_index, posting_index, content, date)' + 
        '   values($1, $2, $3, $4, CURRENT_TIMESTAMP);';
    const values = [id, boardIndex, postingIndex, content];

    return client.query(text, values);
}

module.exports.updateComment = (id, postingIndex, content, commentIndex) =>{
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from dungeonus_schema.posting' +
        '   where posting_index = $2' + 
        ')' +
        'update dungeonus_schema.comment' + 
        '   set content = $3' + 
        '   where comment_index = $4;';
    const values = [id, postingIndex, content, commentIndex];

    return client.query(text, values);
}

module.exports.deleteComment = (id, postingIndex, commentIndex)=>{
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from dungeonus_schema.posting' +
        '   where posting_index = $2' + 
        ')' +
        'delete from dungeonus_schema.comment' + 
        '   where comment_index = $3;';
    const values = [id, postingIndex, commentIndex];

    return client.query(text, values);
}

module.exports.selectAllComment = ()=>{
    const text = 'select * from dungeonus_schema.comment;';
    const values = [];

    return client.query(text, values);
}
