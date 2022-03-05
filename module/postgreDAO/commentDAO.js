const client = require("../connectClient.js");
const {DBInfo, DBUtil} = require("../databaseModule");

// commentDAO.js
module.exports.selectCommentWithcommentIndex = (commentIndex) => {
    const text = 'select * from dungeonus_schema.comment' + 
        '   where comment_index = $1;';
    const values = [commentIndex];

    return client.query(text, values);
}

module.exports.insertComment = (id, postingIndex, title, content) => {
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from dungeonus_schema.posting' +
        '   where posting_index = $2' + 
        ')' +
        'insert into dungeonus_schema.comment' + 
        '   (id, posting_index, title, content)' + 
        '   values($1, $2, $3, $4, CURRENT_TIMESTAMP);';
    const values = [id, postingIndex, title, content];

    return client.query(text, values);
}

module.exports.updateComment = (id, postingIndex, title, content, commentIndex) =>{
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '), postingExist as (' + 
        'select * from dungeonus_schema.posting' +
        '   where posting_index = $2' + 
        ')' +
        'update dungeonus_schema.comment' + 
        '   set title = $2, content = $3' + 
        '   where comment_index = $4;';
    const values = [id, postingIndex, title, content, commentIndex];

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
        'delete dungeonus_schema.comment' + 
        '   where comment_index = $3;';
    const values = [id, postingIndex, commentIndex];

    return client.query(text, values);
}

module.exports.selectAllComment = ()=>{
    const text = 'select * from dungeonus_schema.comment;';
    const values = [];

    return client.query(text, values);
}

module.exports.selectAllBoardWithCommentIndex = (boardIndex)=>{
    const text = 'select comment_index, id, title, date from dungeonus_schema.comment ' +
        'where board_index = $1;';
    const values = [boardIndex];

    return client.query(text, values);
}

module.exports.selectCommentTitleLike = (word)=>{
    const text = 'select comment_index, id, title, date from dungeonus_schema.comment ' + 
        'where title like $1;';
    const values = ['%' + word + '%'];

    return client.query(text, values);
}