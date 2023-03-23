const formatEntitiesMetrics = (result: []) => {

  const metrics = [];
  const metricsInvalid = ['reliability_rating', 'security_rating', 'test_success_density'];

  // eslint-disable-next-line no-restricted-syntax
  for (const item of result.results) {
    if (!metricsInvalid.includes(item.key)) {
      metrics.push(item.key);
    }
  }

  return [metrics];
};

export default formatEntitiesMetrics;
