const { body } = require('express-validator');

const quejaSugerenciaBodyValidator = [
  body('tipo').isIn(['QUEJA', 'SUGERENCIA']).withMessage('Tipo inválido'),
  body('mensaje').trim().isLength({ min: 10, max: 2000 }).withMessage('Entre 10 y 2000 caracteres'),
  body('anonimo').optional().isBoolean(),
];

module.exports = { quejaSugerenciaBodyValidator };
