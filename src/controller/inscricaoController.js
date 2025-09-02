const inscricaoModel = require('../model/inscricaoModel');


exports.inscricao = async (req, res) => {
    try{
        const usuario_id = req.user.id;
        const { evento_id } = req.body;
        
        const novaInscricao = await inscricaoModel.inscricao(usuario_id, evento_id);
        
        res.status(201).json({
            message: 'Inscricao realizada com sucesso',
            inscricao: novaInscricao
        })
    } catch (err){
        console.error(err);
        res.status(err.status || 500).json({error: err.message || 'Erro ao realizar inscrição'})
    }   
}

exports.meusEventos = async (req, res) => {
    try{
        const usuario_id = req.user.id //pega do token jwt
        const eventos = await inscricaoModel.listarEventosCadastrados(usuario_id);

        res.status(200).json({eventos_inscritos: eventos});
    } catch (err){
        console.error(err);
        res.status(err.status || 500).json({error: err.message || 'Erro ao buscar eventos'})
    }
}


exports.InscritosDoEvento = async (req, res) => {
    try{
        const { evento_id } = req.params;
        //validar se é admin
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({error: 'acesso negado bb'})
        }

        const inscritos = await inscricaoModel.listarInscritosPorEvento(evento_id);

        res.status(200).json({evento_id, inscritos});
    } catch (err){
        console.error(err);
        res.status(err.status || 500).json({error: err.message || 'Erro ao buscar inscritos'})
    }
}

exports.cancelarInscricao = async (req, res) => {
    const usuarioId = req.user.id; // assumindo middleware que decodifica o JWT e adiciona req.usuario
    const eventoId = parseInt(req.params.eventoId);

    if (!eventoId) {
        return res.status(400).json({ message: 'ID do evento é obrigatório' });
    }

    try {
        const inscricao = await inscricaoModel.cancelarInscricao(usuarioId, eventoId);
        if (!inscricao) {
            return res.status(404).json({ message: 'Inscrição não encontrada' });
        }
        res.status(200).json({ message: 'Inscrição cancelada com sucesso', inscricao });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Erro interno' });
    }
};
