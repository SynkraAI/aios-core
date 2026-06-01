/**
 * Metrics runtime loader helpers.
 *
 * Keeps metrics-only payload dependencies out of the general CLI boot path.
 */

function wrapMissingMetricsDependency(error) {
  if (error?.code !== 'MODULE_NOT_FOUND') {
    return error;
  }

  const wrapped = new Error(
    'Metrics support is unavailable in this installation. ' +
    'Reinstall or update the package so `.aiox-core/quality/` is included, ' +
    'then retry the metrics command.',
  );
  wrapped.cause = error;
  return wrapped;
}

function loadMetricsCollector() {
  try {
    return require('../../../quality/metrics-collector');
  } catch (error) {
    throw wrapMissingMetricsDependency(error);
  }
}

function loadSeedMetricsModule() {
  try {
    return require('../../../quality/seed-metrics');
  } catch (error) {
    throw wrapMissingMetricsDependency(error);
  }
}

module.exports = {
  loadMetricsCollector,
  loadSeedMetricsModule,
};
