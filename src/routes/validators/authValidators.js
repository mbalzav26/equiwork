const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

const changePasswordValidator = [
  body('password_actual').notEmpty().withMessage('Contraseña actual requerida'),
  body('password_nueva')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
  body('password_confirmacion')
    .custom((value, { req }) => value === req.body.password_nueva)
    .withMessage('La confirmación no coincide'),
];

module.exports = { loginValidator, changePasswordValidator };
