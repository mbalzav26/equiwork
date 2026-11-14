const { body } = require('express-validator');
const { tipoEventoBodyValidator } = require('./tipoEventoValidator');

const encuestaEventoValidator = [
  body('quincena_id').isInt({ min: 1 }).withMessage('Quincena inválida'),
  tipoEventoBodyValidator,
  body('descripcion').trim().notEmpty().withMessage('Descripción requerida').isLength({ max: 255 }),
  body('horas').isFloat({ min: 0.25, max: 24 }).withMessage('Horas entre 0.25 y 24'),
  body('fecha_evento').isISO8601().withMessage('Fecha inválida'),
  body('nombre_empresa')
    .trim()
    .notEmpty()
    .withMessage('Nombre de la empresa requerido')
    .isLength({ max: 120 }),
  body('direccion').trim().notEmpty().withMessage('Dirección requerida').isLength({ max: 255 }),
  body('auxilio_transporte')
    .optional({ values: 'falsy' })
    .isBoolean()
    .withMessage('Valor inválido para auxilio de transporte')
    .toBoolean(),
  body('comentarios_transporte')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comentarios demasiado largos'),
  body('comentarios_transporte').custom((value, { req }) => {
    const auxilio =
      req.body.auxilio_transporte === true ||
      req.body.auxilio_transporte === 'true' ||
      req.body.auxilio_transporte === 1 ||
      req.body.auxilio_transporte === '1';
    if (auxilio && (!value || !String(value).trim())) {
      throw new Error('Indique comentarios cuando solicita auxilio de transporte');
    }
    return true;
  }),
];

module.exports = { encuestaEventoValidator };
