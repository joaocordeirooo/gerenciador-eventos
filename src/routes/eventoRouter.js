const express = require('express');
const router = express.Router();
const eventoController = require('../controller/eventoController');
const { autenticar }= require('../middleware/middleware');

// CRUD eventos
router.post('/criar-evento', autenticar, eventoController.criarEvento);
router.put('/:id', autenticar, eventoController.editarEvento);
router.delete('/:id', autenticar, eventoController.deletarEvento);

// Eventos disponíveis para usuários
router.get('/eventos-disponiveis', autenticar, eventoController.eventosDisponiveis);

// Inscrições (admin)
router.get('/inscricoes', autenticar, eventoController.listarInscricoes);

module.exports = router;
