const express = require('express');
const homeController = require('../controllers/homeController');
const authController = require('../controllers/authController');
const colaboradorController = require('../controllers/colaboradorController');
const eventoController = require('../controllers/eventoController');
const dashboardController = require('../controllers/dashboardController');
const reporteController = require('../controllers/reporteController');
const encuestaController = require('../controllers/encuestaController');
const tipoActividadController = require('../controllers/tipoActividadController');
const perfilController = require('../controllers/perfilController');
const quejaSugerenciaController = require('../controllers/quejaSugerenciaController');
const miCargaController = require('../controllers/miCargaController');
const {
  authenticateWeb,
  denyColaboradorStaff,
  requireColaboradorWeb,
  requireAdminWeb,
  requirePasswordChangeWeb,
} = require('../middlewares/authMiddleware');
const { validationResult } = require('express-validator');
const { loginValidator, changePasswordValidator } = require('./validators/authValidators');

const router = express.Router();

router.get('/', homeController.index.bind(homeController));
router.get('/login', authController.showLogin.bind(authController));
router.post('/login', loginValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('pages/login', {
      title: 'Iniciar sesión',
      error: errors.array()[0].msg,
    });
  }
  return authController.loginWeb(req, res, next);
});
router.post('/logout', authController.logout.bind(authController));

router.use(authenticateWeb);

router.get('/cambiar-contrasena', authController.showChangePassword.bind(authController));
router.post('/cambiar-contrasena', changePasswordValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('pages/cambiar-contrasena', {
      title: 'Nueva contraseña',
      error: errors.array()[0].msg,
      usuario: req.usuario,
    });
  }
  return authController.changePasswordWeb(req, res, next);
});

router.use(requirePasswordChangeWeb);

router.get('/perfil', perfilController.pagePerfil.bind(perfilController));

router.get(
  '/encuesta',
  requireColaboradorWeb,
  encuestaController.pageEncuesta.bind(encuestaController)
);
router.get(
  '/quejas-sugerencias',
  requireColaboradorWeb,
  quejaSugerenciaController.pageColaborador.bind(quejaSugerenciaController)
);
router.get(
  '/mi-carga',
  requireColaboradorWeb,
  miCargaController.pageMiCarga.bind(miCargaController)
);
router.get(
  '/catalogo-actividades',
  requireColaboradorWeb,
  miCargaController.pageCatalogoActividades.bind(miCargaController)
);

router.use(denyColaboradorStaff);

router.get('/dashboard', dashboardController.pageDashboard.bind(dashboardController));
router.get('/colaboradores', colaboradorController.pageList.bind(colaboradorController));
router.get('/eventos', eventoController.pageRegistro.bind(eventoController));
router.get(
  '/actividades',
  requireAdminWeb,
  tipoActividadController.pageActividades.bind(tipoActividadController)
);
router.get('/reportes', reporteController.pageReportes.bind(reporteController));
router.get(
  '/quejas-admin',
  requireAdminWeb,
  quejaSugerenciaController.pageAdmin.bind(quejaSugerenciaController)
);

module.exports = router;
