const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer token"
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

function verificarAdmin(req, res, next) {
    if (!req.user || req.user.tipo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado: apenas admin' });
    }
    next();
}

module.exports = {autenticar, verificarAdmin};
