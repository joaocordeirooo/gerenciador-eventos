const eventoModel = require('../model/eventoModel');

// Criar evento
exports.criarEvento = async (req, res) => {
    const { nome, descricao, data, local } = req.body;
    try {
        const novoEvento = await eventoModel.criarEvento(nome, descricao, data, local);
        res.status(201).json({ message: 'Evento cadastrado!', evento: novoEvento });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
    }
};

// Editar evento
exports.editarEvento = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, data, local } = req.body;
    try {
        await eventoModel.editarEvento(id, nome, descricao, data, local);
        res.json({ message: 'Evento atualizado!' });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
    }
};

// Deletar evento
exports.deletarEvento = async (req, res) => {
    const { id } = req.params;
    try {
        await eventoModel.deletarEvento(id);
        res.json({ message: 'Evento excluído!' });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
    }
};

// Eventos disponíveis para usuários
exports.eventosDisponiveis = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const eventos = await eventoModel.listarEventosDisponiveis(usuario_id);
        res.json({ eventos_disponiveis: eventos });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || 'Erro ao buscar eventos' });
    }
};

// Listar todas as inscrições (admin)
exports.listarInscricoes = async (req, res) => {
    try {
        const inscricoes = await eventoModel.listarTodasInscricoes();
        res.json(inscricoes);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || 'Erro ao listar inscrições' });
    }
};
