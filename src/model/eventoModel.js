const db = require('../config/database');

exports.criarEvento = async (nome, descricao, data, local) => {
    const result = await db.query(
        'INSERT INTO eventos (nome, descricao, data, local) VALUES ($1, $2, $3, $4) RETURNING id',
        [nome, descricao, data, local]
    );
    const id = result.rows[0].id;
    return { id, nome, descricao, data, local };
};

exports.editarEvento = async (id, nome, descricao, data, local) => {
    await db.query(
        'UPDATE eventos SET nome=$1, descricao=$2, data=$3, local=$4 WHERE id=$5',
        [nome, descricao, data, local, id]
    );
};

exports.deletarEvento = async (id) => {
    await db.query('DELETE FROM eventos WHERE id=$1', [id]);
};

exports.listarEventosDisponiveis = async (usuario_id) => {
    const result = await db.query(
        `SELECT e.id, e.nome, e.descricao, e.data, e.local
         FROM eventos e
         WHERE e.id NOT IN (SELECT evento_id FROM inscricoes WHERE usuario_id=$1)
         ORDER BY e.data ASC`,
        [usuario_id]
    );
    return result.rows;
};

// Listar todas inscrições (admin)
exports.listarTodasInscricoes = async () => {
    const result = await db.query(
        `SELECT i.id, i.usuario_id, u.nome AS user_name, u.email AS user_email,
                e.id AS event_id, e.nome AS event_name, i.created_at
         FROM inscricoes i
         JOIN usuarios u ON i.usuario_id = u.id
         JOIN eventos e ON i.evento_id = e.id
         ORDER BY e.data ASC`
    );
    return result.rows.map(r => ({
        id: r.id,
        user: { id: r.usuario_id, name: r.user_name, email: r.user_email },
        event: { id: r.event_id, nome: r.event_name },
        createdAt: r.created_at
    }));
};


exports.cancelarInscricao = async (usuarioId, eventoId) => {
    try {
        // Supondo que você tenha uma tabela "inscricoes" com usuario_id e evento_id
        const query = `
            DELETE FROM inscricoes 
            WHERE usuario_id = $1 AND evento_id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [usuarioId, eventoId]);
        return result.rows[0]; 
    } catch (err) {
        console.error(err);
        throw new Error('Erro ao cancelar inscrição');
    }
};
