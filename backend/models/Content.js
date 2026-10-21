const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  imagemUrl: { type: String, required: true },
  categoria: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);