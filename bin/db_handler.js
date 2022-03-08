var knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
        host : 'localhost',
        user : 'sdsoft_user',
        password : '.sdsoft123456',
        database : 'sdsoft_db'
    }
});
module.exports = knex;