const db = require('../config/database');
const bcrypt = require('bcryptjs');


exports.criarUsuario = async({nome, email, senha, tipo}) => {
    //verificar se o usuario ja existe
    const existe = await db.query(`SELECT id FROM usuarios WHERE email = $1`, [email]);
    if (existe.rowCount > 0){
        throw {status: 409, message: 'Email já cadastrado hein'};
    }

    const hashSenha = await bcrypt.hash(senha, 10);

    const result = await db.query(
        `INSERT INTO usuarios (nome, email, senha, tipo) VALUES 
        ($1, $2, $3, $4) RETURNING id`, [nome, email, hashSenha, tipo]
    );

    const id = result.rows[0].id;
    
    return {id, nome, email, tipo}
}

exports.login = async(email, senha) => {
    const result = await db.query(
        'SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = $1', [email]
    );

    if (result.rowCount === 0) {
        throw {status: 401, message: 'Usuario não encontrado'}
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida){
        throw {status: 401, message: 'Senha invalida'}
    }

    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email, 
        tipo: usuario.tipo
    }
}

exports.listarUsuarios = async () => {
    const result = await db.query(
        `SELECT u.id, u.name, u.email, u.role, u.created_at,
                COUNT(i.id) AS registrations_count
         FROM usuarios u
         LEFT JOIN inscricoes i ON i.usuario_id = u.id
         GROUP BY u.id
         ORDER BY u.created_at ASC`
    );

    return result.rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.created_at,
        registrations: Array(u.registrations_count).fill(null) // só para compatibilidade com front
    }));
};
