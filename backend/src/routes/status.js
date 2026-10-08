function registerStatusRoutes(app, { store, maxInMemory, dataFile }) {
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      mediciones_totales: store.getTotal(),
      ultima_medicion: store.getLast(),
      ventana_en_memoria: store.getMeasurements().length,
      max_en_memoria: maxInMemory,
      archivo_datos: dataFile,
    });
  });
}

module.exports = { registerStatusRoutes };
