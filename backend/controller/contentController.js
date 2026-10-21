const contentService = require('../service/contentService');

const getAll = async (req, res) => {
  try {
    const { busca } = req.query;
    const conteudos = await contentService.getAll(busca);
    res.json(conteudos);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar conteúdos.' });
  }
};

const create = async (req, res) => {
  try {
    const novoConteudo = await contentService.create(req.body);
    res.status(201).json(novoConteudo);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao criar conteúdo.' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const conteudoAtualizado = await contentService.update(id, req.body);
    if (!conteudoAtualizado) {
      return res.status(404).json({ mensagem: 'Conteúdo não encontrado.' });
    }
    res.json(conteudoAtualizado);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao editar conteúdo.' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deletado = await contentService.remove(id);
    if (!deletado) {
      return res.status(404).json({ mensagem: 'Conteúdo não encontrado.' });
    }
    res.json({ mensagem: 'Conteúdo excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao excluir conteúdo.' });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
