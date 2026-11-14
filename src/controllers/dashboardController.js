const dashboardService = require('../services/dashboardService');
const quincenaService = require('../services/quincenaService');

class DashboardController {
  async pageDashboard(req, res, next) {
    try {
      res.render('pages/dashboard', {
        title: 'Dashboard',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async balanceApi(req, res, next) {
    try {
      const quincenaId = req.params.quincenaId || req.query.quincena_id;
      const data = await dashboardService.obtenerBalance(quincenaId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async quincenasApi(req, res, next) {
    try {
      const data = await quincenaService.listar();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async ensureQuincenaActualApi(req, res, next) {
    try {
      const data = await quincenaService.asegurarQuincenaActual();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
