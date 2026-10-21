const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async ({ nome, email, senha }) => {
  const usuarioExiste = await User.findOne({ email });
  if (usuarioExiste) {
    const error = new Error('E-mail já cadastrado.');
    error.statusCode = 400;
    throw error;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const novoUsuario = new User({ nome, email, senha: senhaHash });
  await novoUsuario.save();

  return novoUsuario;
};

const login = async ({ email, senha }) => {
  const usuario = await User.findOne({ email });
  if (!usuario) {
    const error = new Error('Usuário não encontrado.');
    error.statusCode = 400;
    throw error;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    const error = new Error('Senha incorreta.');
    error.statusCode = 400;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ ERRO CRÍTICO: JWT_SECRET não está definido no arquivo .env!');
    const error = new Error('Erro de configuração no servidor.');
    error.statusCode = 500;
    error.isConfigError = true;
    throw error;
  }

  const token = jwt.sign(
    { id: usuario._id, nome: usuario.nome, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    usuario: {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      foto: usuario.foto || '',
      telefone: usuario.telefone || '',
      cpf: usuario.cpf || ''
    }
  };
};

const updateProfile = async (userId, dados) => {
  const camposAtualizar = {};
  if (dados.nome !== undefined) camposAtualizar.nome = dados.nome;
  if (dados.email !== undefined) camposAtualizar.email = dados.email;
  if (dados.foto !== undefined) camposAtualizar.foto = dados.foto;
  if (dados.telefone !== undefined) camposAtualizar.telefone = dados.telefone;
  if (dados.cpf !== undefined) camposAtualizar.cpf = dados.cpf;

  const usuarioAtualizado = await User.findByIdAndUpdate(userId, camposAtualizar, { new: true });
  if (!usuarioAtualizado) {
    const error = new Error('Usuário não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: usuarioAtualizado._id,
    nome: usuarioAtualizado.nome,
    email: usuarioAtualizado.email,
    foto: usuarioAtualizado.foto || '',
    telefone: usuarioAtualizado.telefone || '',
    cpf: usuarioAtualizado.cpf || ''
  };
};

module.exports = {
  register,
  login,
  updateProfile
};
