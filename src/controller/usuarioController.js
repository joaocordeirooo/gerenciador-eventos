const usuarioModel = require('../model/usuarioModel');
const jwt =  require('jsonwebtoken');
const jwtConfig = require('../config/jwt');


exports.cadastrarUsuario = async(req, res) => {
    const {nome, email, senha, tipo} = req.body;

    try{
        const novoUsuario = await usuarioModel.criarUsuario({
            nome, 
            email, 
            senha, 
            tipo
        });

         const token = jwt.sign(
            { id: novoUsuario.id, email: novoUsuario.email, tipo: novoUsuario.tipo },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        res.status(200).json({message: "cadastro feito com sucesso", usuario: novoUsuario, token});
    } catch (err){
        console.error(err);
        res.status(err.status || 500).json({error: err.message || 'Erro interno'})
    }
 }


 exports.login = async(req, res) => {
    const {email, senha} = req.body; 

    try{
        const usuario = await usuarioModel.login(email, senha);

        const token = jwt.sign(
            {id: usuario.id, email: usuario.email, tipo: usuario.tipo},
            jwtConfig.secret, 
            {expiresIn: jwtConfig.expiresIn}
        );

        res.json({
            message: 'login realizado',
            token, 
            usuario
        });
    } catch (err){
        console.error(err);
        res.status(err.status || 500).json({error: err.message || 'erro ao realizar login'});
    }
 }

 // Listar todos os usuários para admin
exports.listarUsuarios = async (req, res) => {
    try {
        // verifica se o usuário é admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const usuarios = await usuarioModel.listarUsuarios();
        res.json(usuarios);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
    }
};