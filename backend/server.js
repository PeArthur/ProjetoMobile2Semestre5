require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Content = require('./models/Content');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com o MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas com sucesso!'))
  .catch(err => console.error('❌ Erro de conexão com MongoDB:', err));

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

// --- ROTAS DE USUÁRIO ---

// 1. Cadastro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = new User({ nome, email, senha: senhaHash });
    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro no servidor ao cadastrar.' });
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
    console.log('🔥 Requisição de login recebida no backend!', req.body);
  try {
    const { email, senha } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(400).json({ mensagem: 'Usuário não encontrado.' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(400).json({ mensagem: 'Senha incorreta.' });

    if (!process.env.JWT_SECRET) {
            console.error('❌ ERRO CRÍTICO: JWT_SECRET não está definido no arquivo .env!');
            return res.status(500).json({ mensagem: 'Erro de configuração no servidor.' });
        }

    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

   console.log('✅ Login realizado com sucesso para:', email);
        res.json({ token, usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email } });
    } catch (error) {
        console.error('❌ ERRO DETALHADO NO CATCH DO LOGIN:', error); 
        res.status(500).json({ mensagem: 'Erro no servidor ao realizar login: ' + error.message });
    }
});

// --- ROTAS DE CONTEÚDO / IMAGENS ---

// 3. Listar todos ou Pesquisar por termo (Acesso Público)
app.get('/api/contents', async (req, res) => {
  try {
    const { busca } = req.query;
    let filtro = {};

    if (busca) {
      filtro = {
        $or: [
          { titulo: { $regex: busca,$options: 'i' } },
          { descricao: { $regex: busca,$options: 'i' } }
        ]
      };
    }

    const conteudos = await Content.find(filtro).sort({ createdAt: -1 });
    res.json(conteudos);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar conteúdos.' });
  }
});

// 4. Criar Novo Conteúdo (Área Administrativa - Protegida)
app.post('/api/contents', autenticar, async (req, res) => {
  try {
    const { titulo, descricao, imagemUrl, categoria } = req.body;
    const novoConteudo = new Content({ titulo, descricao, imagemUrl, categoria });
    await novoConteudo.save();
    res.status(201).json(novoConteudo);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao criar conteúdo.' });
  }
});

// 5. Editar Conteúdo / Imagem (Área Administrativa - Protegida)
app.put('/api/contents/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const conteudoAtualizado = await Content.findByIdAndUpdate(id, req.body, { new: true });
    if (!conteudoAtualizado) return res.status(404).json({ mensagem: 'Conteúdo não encontrado.' });
    res.json(conteudoAtualizado);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao editar conteúdo.' });
  }
});

// 6. Excluir Conteúdo / Imagem (Área Administrativa - Protegida)
app.delete('/api/contents/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const deletado = await Content.findByIdAndDelete(id);
    if (!deletado) return res.status(404).json({ mensagem: 'Conteúdo não encontrado.' });
    res.json({ mensagem: 'Conteúdo excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao excluir conteúdo.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));