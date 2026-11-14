const quincenaRepository = require('../repositories/quincenaRepository');
const { obtenerRangoQuincena } = require('../utils/quincenaHelper');
const AppError = require('../utils/AppError');

class QuincenaService {
  listar() {
    return quincenaRepository.findAll();
  }

  async obtenerPorId(id) {
    const quincena = await quincenaRepository.findById(id);
    if (!quincena) {
      throw new AppError('Quincena no encontrada', 404, 'QUINCENA_NOT_FOUND');
    }
    return quincena;
  }

  async asegurarQuincenaActual() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth() + 1;
    const dia = hoy.getDate();
    const numeroQuincena = dia <= 15 ? 1 : 2;
    const rango = obtenerRangoQuincena(anio, mes, numeroQuincena);
    return quincenaRepository.findOrCreateByPeriodo(anio, mes, numeroQuincena, rango);
  }

  async crearPeriodo(anio, mes, numeroQuincena) {
    const rango = obtenerRangoQuincena(anio, mes, numeroQuincena);
    return quincenaRepository.findOrCreateByPeriodo(anio, mes, numeroQuincena, rango);
  }
}

module.exports = new QuincenaService();
