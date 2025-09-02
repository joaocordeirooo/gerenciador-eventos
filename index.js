const express = require('express');
require('dotenv').config();
const cors = require('cors');


const app = express();
const PORT = 3002; 

const db = require('./src/config/database')

app.use(cors());
app.use(express.json());


//variaveis para rota
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const eventoRouter = require('./src/routes/eventoRouter');
const inscricaoRoutes = require('./src/routes/inscricaoRoutes');


app.use('/usuarios', usuarioRoutes)
app.use('/evento', eventoRouter)
app.use('/inscrever-se', inscricaoRoutes)

app.listen(PORT, () => {
    console.log(`Backend rodando em: http://localhost:${PORT}`);
})