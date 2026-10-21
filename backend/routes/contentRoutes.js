const express = require('express');
const router = express.Router();
const contentController = require('../controller/contentController');
const autenticar = require('../middleware/authMiddleware');

// 3. Listar todos ou Pesquisar por termo (Acesso Público)
router.get('/', contentController.getAll);

// 4. Criar Novo Conteúdo (Área Administrativa - Protegida)
router.post('/', autenticar, contentController.create);

// 5. Editar Conteúdo / Imagem (Área Administrativa - Protegida)
router.put('/:id', autenticar, contentController.update);

// 6. Excluir Conteúdo / Imagem (Área Administrativa - Protegida)
router.delete('/:id', autenticar, contentController.remove);

module.exports = router;
