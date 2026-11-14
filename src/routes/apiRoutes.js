const express = require('express');
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
  authenticate,
  requireRoles,
  requireColaborador,
  requirePasswordChangedApi,
} = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { loginValidator, changePasswordValidator } = require('./validators/authValidators');
const { colaboradorBodyValidator } = require('./validators/colaboradorValidators');
const { eventoBodyValidator } = require('./validators/eventoValidators');
const { encuestaEventoValidator } = require('./validators/encuestaValidators');
const {
  tipoActividadBodyValidator,
  tipoActividadDescripcionValidator,
} = require('./validators/tipoActividadValidators');
const { perfilUpdateValidator } = require('./validators/perfilValidators');
const { quejaSugerenciaBodyValidator } = require('./validators/quejaSugerenciaValidators');
const { Usuario } = require('../models');
const uploadAvatar = require('../middlewares/uploadAvatar');

const router = express.Router();

router.post('/auth/login', loginValidator, validateRequest, authController.loginApi.bind(authController));

router.use(authenticate);

router.get('/auth/me', authController.me.bind(authController));
router.post(
  '/auth/cambiar-contrasena',
  changePasswordValidator,
  validateRequest,
  authController.changePasswordApi.bind(authController)
);

router.use(requirePasswordChangedApi);

router.get('/perfil', perfilController.getApi.bind(perfilController));
router.put(
  '/perfil',
  perfilUpdateValidator,
  validateRequest,
  perfilController.updateApi.bind(perfilController)
);
router.post(
  '/perfil/cambiar-contrasena',
  changePasswordValidator,
  validateRequest,
  perfilController.changePasswordApi.bind(perfilController)
);
router.post('/perfil/foto', (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return next(err);
    return perfilController.uploadFotoApi(req, res, next);
  });
});

router.post(
  '/quejas-sugerencias',
  requireColaborador,
  quejaSugerenciaBodyValidator,
  validateRequest,
  quejaSugerenciaController.createApi.bind(quejaSugerenciaController)
);
router.get(
  '/quejas-sugerencias/mias',
  requireColaborador,
  quejaSugerenciaController.listMiasApi.bind(quejaSugerenciaController)
);
router.get(
  '/quejas-sugerencias/admin',
  requireRoles(Usuario.ROLES.ADMINISTRADOR),
  quejaSugerenciaController.listAdminApi.bind(quejaSugerenciaController)
);

router.get(
  '/colaborador/mi-carga',
  requireColaborador,
  miCargaController.miCargaApi.bind(miCargaController)
);
router.get(
  '/colaborador/historial-quincenas',
  requireColaborador,
  miCargaController.historialQuincenasApi.bind(miCargaController)
);
router.get(
  '/colaborador/notificaciones',
  requireColaborador,
  miCargaController.notificacionesApi.bind(miCargaController)
);
router.get(
  '/colaborador/mi-carga/export/:quincenaId',
  requireColaborador,
  miCargaController.exportJsonApi.bind(miCargaController)
);

router.get('/tipos-actividad', tipoActividadController.listApi.bind(tipoActividadController));
router.get(
  '/tipos-actividad/admin',
  requireRoles(Usuario.ROLES.ADMINISTRADOR),
  tipoActividadController.listAdminApi.bind(tipoActividadController)
);
router.post(
  '/tipos-actividad',
  requireRoles(Usuario.ROLES.ADMINISTRADOR),
  tipoActividadBodyValidator,
  validateRequest,
  tipoActividadController.createApi.bind(tipoActividadController)
);
router.delete(
  '/tipos-actividad/:id',
  requireRoles(Usuario.ROLES.ADMINISTRADOR),
  tipoActividadController.deactivateApi.bind(tipoActividadController)
);
router.post(
  '/tipos-actividad/:id/activar',
  requireRoles(Usuario.ROLES.ADMINISTRADOR),
  tipoActividadController.activateApi.bind(tipoActividadController)
);
router.patch(
  '/tipos-actividad/:id',
  requireRoles(Usuario.ROLES.ADMINISTRADOR),
  tipoActividadDescripcionValidator,
  validateRequest,
  tipoActividadController.updateDescripcionApi.bind(tipoActividadController)
);

router.post(
  '/encuesta/eventos',
  requireColaborador,
  encuestaEventoValidator,
  validateRequest,
  encuestaController.createApi.bind(encuestaController)
);
router.get(
  '/encuesta/historial/:quincenaId',
  requireColaborador,
  encuestaController.historialApi.bind(encuestaController)
);
router.get(
  '/encuesta/resumen/:quincenaId',
  requireColaborador,
  encuestaController.resumenApi.bind(encuestaController)
);
router.delete(
  '/encuesta/eventos/:id',
  requireColaborador,
  encuestaController.deleteApi.bind(encuestaController)
);

router.get('/colaboradores', colaboradorController.listApi.bind(colaboradorController));
router.get('/colaboradores/:id', colaboradorController.getApi.bind(colaboradorController));
router.post(
  '/colaboradores',
  requireRoles(Usuario.ROLES.ADMINISTRADOR, Usuario.ROLES.SUPERVISOR),
  colaboradorBodyValidator,
  validateRequest,
  colaboradorController.createApi.bind(colaboradorController)
);
router.put(
  '/colaboradores/:id',
  requireRoles(Usuario.ROLES.ADMINISTRADOR, Usuario.ROLES.SUPERVISOR),
  colaboradorBodyValidator,
  validateRequest,
  colaboradorController.updateApi.bind(colaboradorController)
);
router.delete(
  '/colaboradores/:id',
  requireRoles(Usuario.ROLES.ADMINISTRADOR),
  colaboradorController.deleteApi.bind(colaboradorController)
);
router.post(
  '/colaboradores/:id/cuenta-encuesta',
  requireRoles(Usuario.ROLES.ADMINISTRADOR, Usuario.ROLES.SUPERVISOR),
  colaboradorController.crearCuentaEncuestaApi.bind(colaboradorController)
);

router.get('/quincenas', dashboardController.quincenasApi.bind(dashboardController));
router.post(
  '/quincenas/actual',
  dashboardController.ensureQuincenaActualApi.bind(dashboardController)
);

router.post(
  '/eventos',
  eventoBodyValidator,
  validateRequest,
  eventoController.createApi.bind(eventoController)
);
router.delete('/eventos/:id', eventoController.deleteApi.bind(eventoController));
router.get(
  '/eventos/historial/:colaboradorId/:quincenaId',
  eventoController.historialApi.bind(eventoController)
);

router.get('/dashboard/balance/:quincenaId', dashboardController.balanceApi.bind(dashboardController));

router.get('/reportes/:quincenaId', reporteController.jsonApi.bind(reporteController));
router.get('/reportes/:quincenaId/export/csv', reporteController.csvExport.bind(reporteController));

module.exports = router;
