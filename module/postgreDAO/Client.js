const {Client} = require('pg');
const accountInfo = require('../../accountData/postgresqlAccountInfo');

const client = new Client({
    user: accountInfo.user,
    host: 'localhost',
    database: 'dungeonus',
    password: accountInfo.password,
    port: 5432,
});

client.connect()
.then(()=> {
    console.log('server connected');
})
.catch((err) => {
    console.log('DB connect error!');
    console.log(err);
});

module.exports = client;