require ('dotenv').config();
const {Pool} = require("pg");


const pool = new Pool({
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    database: process.env.DB_NAME, 
    user: process.env.DB_USER, 
    password: String(process.env.DB_PASSWORD)
})


pool.connect((err, client, release ) => {
    if(err){
        console.error('Erro ao se conectar com o banco', err.stack)
    } else {
        console.log('conexão feita com sucesso');
        release();
    }
})

module.exports = pool;