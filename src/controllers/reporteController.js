const reporteService = require('../services/reporteService');

class ReporteController {
  async pageReportes(req, res, next) {
    try {
      res.render('pages/reportes', {
        title: 'Reportes',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async jsonApi(req, res, next) {
    try {
      const data = await reporteService.resumenQuincenal(req.params.quincenaId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async csvExport(req, res, next) {
    try {
      const csv = await reporteService.resumenQuincenalCsv(req.params.quincenaId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="equiwork-quincena-${req.params.quincenaId}.csv"`
      );
      res.send('\uFEFF' + csv);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReporteController();
