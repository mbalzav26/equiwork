const { body } = require('express-validator');
const { tipoEventoBodyValidator } = require('./tipoEventoValidator');

const eventoBodyValidator = [
  body('colaborador_id').isInt({ min: 1 }).withMessage('Colaborador inválido'),
  body('quincena_id').isInt({ min: 1 }).withMessage('Quincena inválida'),
  tipoEventoBodyValidator,
  body('descripcion').trim().notEmpty().withMessage('Descripción requerida').isLength({ max: 255 }),
  body('horas').isFloat({ min: 0.25, max: 24 }).withMessage('Horas entre 0.25 y 24'),
  body('fecha_evento').isISO8601().withMessage('Fecha inválida'),
];

module.exports = { eventoBodyValidator };
