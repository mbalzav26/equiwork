const { body } = require('express-validator');

const perfilUpdateValidator = [
  body('nombre').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('colaborador.nombres').optional().trim().isLength({ min: 1, max: 80 }),
  body('colaborador.apellidos').optional().trim().isLength({ min: 1, max: 80 }),
  body('colaborador.cargo').optional().trim().isLength({ min: 1, max: 80 }),
  body('colaborador.area').optional().trim().isLength({ min: 1, max: 80 }),
];

module.exports = { perfilUpdateValidator };
