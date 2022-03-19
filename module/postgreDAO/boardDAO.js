const client = require("../connectClient.js");
const {DBInfo, DBUtil} = require("../databaseModule");

// boardDAO.js
module.exports.selectPostingWithpostingIndex = (postingIndex) => {
    const text = 'select * from dungeonus_schema.posting' + 
        '   where posting_index = $1;';
    const values = [postingIndex];

    return client.query(text, values);
}

module.exports.insertPosting = (id, title, content, boardIndex) => {
    const text = 'with checkid as (' + 
        '   select * from dungeonus_schema.login' + 
        '       where id = $1' + 
        ')' + 
        'insert into dungeonus_schema.posting(' + 
        'id, title, content, date, board_index'+
        ')'+
        '   values((select id from checkid), $2, $3, CURRENT_TIMESTAMP, $4);';
    const values = [id, title, content, boardIndex];

    return client.query(text, values);
}

module.exports.updatePosting = (id, title, content, postingIndex) =>{
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '),' + 
        ' checkindex as (' + 
        'select * from dungeonus_schema.posting' + 
        '   where posting_index = $4' + 
        ')' + 
        'update dungeonus_schema.posting' + 
        '   set title = $2, content = $3' + 
        '   where posting_index = (select posting_index from checkindex) and' + 
        '   id = (select id from checkid);';
    const values = [id, title, content, postingIndex];
    return client.query(text, values);
}

module.exports.deletePosting = (id, postingIndex)=>{
    const text = 'with checkid as (' + 
        'select * from dungeonus_schema.login' + 
        '   where id = $1' + 
        '),' + 
        ' checkindex as (' + 
        'select * from dungeonus_schema.posting' + 
        '   where posting_index = $2' + 
        ')' + 
        'delete from dungeonus_schema.posting' + 
        '   where posting_index = (select posting_index from checkindex) and' +
        '   id = (select id from checkid);';
    const values = [id, postingIndex];

    return client.query(text, values);
}

module.exports.selectAllPosting = ()=>{
    const text = 'select * from dungeonus_schema.posting;';
    const values = [];

    return client.query(text, values);
}

module.exports.selectAllBoardWithPostingIndex = (boardIndex)=>{
    const text = 'select posting_index, id, title, date from dungeonus_schema.posting ' +
        'where board_index = $1;';
    const values = [boardIndex];

    return client.query(text, values);
}

module.exports.selectPostingTitleLike = (word)=>{
    const text = 'select posting_index, id, title, date from dungeonus_schema.posting ' + 
        'where title like $1;';
    const values = ['%' + word + '%'];

    return client.query(text, values);
}

module.exports.idExists = (id) => {
     const text = 'select * from dungeonus_schema.login where id = $1'
     const values = [id]

     return client.query(text, values);
}

module.exports.postingIndexExists = (postingIndex) => {
    const text = 'select * from dungeonus_schema.posting where posting_index = $1'
    const values = [postingIndex]

    return client.query(text, values);
}