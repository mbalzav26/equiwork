const { body } = require('express-validator');

const tipoActividadBodyValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('Nombre requerido')
    .isLength({ min: 2, max: 80 })
    .withMessage('Entre 2 y 80 caracteres'),
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('Describe de qué trata la actividad')
    .isLength({ min: 10, max: 500 })
    .withMessage('Entre 10 y 500 caracteres'),
];

const tipoActividadDescripcionValidator = [
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('Descripción requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('Entre 10 y 500 caracteres'),
];

module.exports = { tipoActividadBodyValidator, tipoActividadDescripcionValidator };
