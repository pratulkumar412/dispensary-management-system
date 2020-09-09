const util = require('util');
const mysql = require('mysql');
/* 
*   Connection to the database
*/

const pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'dispensary'
});

pool.getConnection((err,connection)=>{
    if(err)
    console.log(err);
    else
    console.log("Connected");

    if(connection)
    connection.release();
    return;    
});

pool.query = util.promisify(pool.query);

module.exports = pool;
