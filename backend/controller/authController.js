const authService = require('../service/authService');

const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    await authService.register({ nome, email, senha });

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ mensagem: error.message });
    }
    res.status(500).json({ mensagem: 'Erro no servidor ao cadastrar.' });
  }
};

const login = async (req, res) => {
  console.log('🔥 Requisição de login recebida no backend!', req.body);
  try {
    const { email, senha } = req.body;
    const resultado = await authService.login({ email, senha });

    console.log('✅ Login realizado com sucesso para:', email);
    res.json(resultado);
  } catch (error) {
    if (error.isConfigError) {
      return res.status(500).json({ mensagem: error.message });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ mensagem: error.message });
    }

    console.error('❌ ERRO DETALHADO NO CATCH DO LOGIN:', error);
    res.status(500).json({ mensagem: 'Erro no servidor ao realizar login: ' + error.message });
  }
};

module.exports = {
  register,
  login
};
