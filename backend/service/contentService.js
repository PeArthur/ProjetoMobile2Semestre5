const Content = require('../models/Content');

const getAll = async (busca) => {
  let filtro = {};

  if (busca) {
    filtro = {
      $or: [
        { titulo: { $regex: busca, $options: 'i' } },
        { descricao: { $regex: busca, $options: 'i' } }
      ]
    };
  }

  return await Content.find(filtro).sort({ createdAt: -1 });
};

const create = async (dados) => {
  const { titulo, descricao, imagemUrl, categoria } = dados;
  const novoConteudo = new Content({ titulo, descricao, imagemUrl, categoria });
  await novoConteudo.save();
  return novoConteudo;
};

const update = async (id, dados) => {
  return await Content.findByIdAndUpdate(id, dados, { new: true });
};

const remove = async (id) => {
  return await Content.findByIdAndDelete(id);
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
