const express = require('express');
const router = express.Router();
const inscricaoController = require('../controller/inscricaoController');
const { autenticar, verificarAdmin } = require('../middleware/middleware');

router.post('/inscrever', autenticar, inscricaoController.inscricao);
router.get('/meus-eventos', autenticar, inscricaoController.meusEventos);
router.get('/evento/:evento_id/inscritos', autenticar, verificarAdmin, inscricaoController.InscritosDoEvento);
router.delete('/:eventoId', autenticar, inscricaoController.cancelarInscricao);

module.exports = router;
