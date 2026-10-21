const jwt = require('jsonwebtoken');

// Middleware para verificar se o usuário está autenticado
const autenticar = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });

  try {
    const decodificado = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.usuario = decodificado;
    next();
  } catch (error) {
    res.status(400).json({ mensagem: 'Token inválido ou expirado.' });
  }
};

module.exports = autenticar;
module.exports.autenticar = autenticar;
