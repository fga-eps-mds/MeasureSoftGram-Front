const formatEntitiesMetrics = (result: []) => {

    console.log(result['results'])

    const metrics = [];
    const metricsInvalid = ['reliability_rating', 'security_rating', 'test_success_density']

    for (let i = 0; i < result['results'].length; i++) {
        if (!metricsInvalid.includes(result['results'][i]['key'])) {
            metrics.push(result['results'][i]['key']);  
        }
    }

    return [metrics];
};

export default formatEntitiesMetrics;