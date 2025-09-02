const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');
const {autenticar, verificarAdmin} = require('../middleware/middleware');


router.post('/cadastrar', usuarioController.cadastrarUsuario);
router.post('/login', usuarioController.login);
router.get('/admin/users', autenticar, verificarAdmin, usuarioController.listarUsuarios);


module.exports = router;