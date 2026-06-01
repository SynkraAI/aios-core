/**
 * Metrics runtime loader helpers.
 *
 * Keeps the CLI boot path independent from the optional metrics runtime files.
 */

function wrapMissingRuntime(error, requestPath) {
  if (error && error.code === 'MODULE_NOT_FOUND' && error.message.includes(requestPath)) {
    throw new Error(
      'Quality metrics runtime is unavailable in this installation. Reinstall or update the published package before using `aiox metrics`.',
    );
  }

  throw error;
}

function loadMetricsCollector() {
  try {
    return require('../../../quality/metrics-collector');
  } catch (error) {
    return wrapMissingRuntime(error, '../../../quality/metrics-collector');
  }
}

function loadSeedMetricsModule() {
  try {
    return require('../../../quality/seed-metrics');
  } catch (error) {
    return wrapMissingRuntime(error, '../../../quality/seed-metrics');
  }
}

module.exports = {
  loadMetricsCollector,
  loadSeedMetricsModule,
};
