const db = require('../config/database');


exports.inscricao = async(usuario_id, evento_id) => {
    //verificar se ja está inscrito 
    const verificacao = await db.query('SELECT id FROM inscricoes WHERE usuario_id = $1 AND evento_id = $2', [usuario_id, evento_id]);

   if (verificacao.rowCount > 0){
    throw {status: 401, message: 'já cadastrado nesse evento papai'};
   }

   const evento = await db.query(`
    SELECT id FROM eventos WHERE id = $1`, [evento_id])

   if (evento.rowCount === 0){
    throw {status: 404, message: 'não existe esse evento'}
   }
   
    const inscricao = await db.query('INSERT INTO inscricoes (usuario_id, evento_id, created_at) VALUES ($1, $2, NOW()) RETURNING id', 
        [usuario_id, evento_id]
    )


    return {id: inscricao.rows[0].id, usuario_id, evento_id};
}

exports.listarEventosCadastrados = async (usuario_id) => {
    const result = await db.query(
        `SELECT e.id, e.nome, e.descricao, e.data, e.local
        FROM inscricoes i 
        JOIN eventos e ON i.evento_id = e.id
        WHERE i.usuario_id = $1
        ORDER by e.data ASC`, [usuario_id]
    );

    return result.rows;
}



exports.listarInscritosPorEvento = async (evento_id) => {
    const result = await db.query(
        `SELECT u.id, u.nome, u.email
        FROM inscricoes i
        JOIN usuarios u ON i.usuario_id = u.id
        WHERE i.evento_id = $1
        ORDER BY u.nome ASC`, [evento_id]
    )

    return result.rows
}

exports.cancelarInscricao = async (usuarioId, eventoId) => {
    try {
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