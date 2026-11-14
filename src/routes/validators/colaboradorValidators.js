const { body } = require('express-validator');

const TIPOS_DOC = ['CC', 'CE', 'TI', 'PA', 'PPT', 'RC'];

const colaboradorBodyValidator = [
  body('nombres').trim().notEmpty().withMessage('Nombres requeridos').isLength({ max: 80 }),
  body('apellidos').trim().notEmpty().withMessage('Apellidos requeridos').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('tipo_documento').trim().notEmpty().isIn(TIPOS_DOC).withMessage('Tipo de documento inválido'),
  body('numero_documento').trim().notEmpty().withMessage('Número de documento requerido').isLength({ max: 20 }),
  body('cargo').trim().notEmpty().withMessage('Cargo requerido'),
  body('area').trim().notEmpty().withMessage('Área requerida'),
  body('rol_cuenta')
    .optional()
    .isIn(['COLABORADOR', 'ADMINISTRADOR'])
    .withMessage('Rol de cuenta inválido'),
  body('roles_cuenta').optional().isArray({ max: 2 }).withMessage('roles_cuenta debe ser una lista'),
  body('roles_cuenta.*')
    .optional()
    .isIn(['COLABORADOR', 'ADMINISTRADOR'])
    .withMessage('Rol de cuenta inválido'),
];

module.exports = { colaboradorBodyValidator };