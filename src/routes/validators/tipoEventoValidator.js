const { body } = require('express-validator');
const tipoActividadService = require('../../services/tipoActividadService');

const tipoEventoBodyValidator = body('tipo_evento')
  .trim()
  .notEmpty()
  .withMessage('Tipo de actividad requerido')
  .isLength({ max: 80 })
  .custom(async (value) => {
    await tipoActividadService.assertTipoActivo(value);
    return true;
  });

module.exports = { tipoEventoBodyValidator };
