const formatEntitiesMetrics = (result: []) => {

    const metrics = [];    

    for (let i = 0; i < result['results'].length; i++) {
        metrics.push(result['results'][i]['key']);  
    }

    return [metrics];
};

export default formatEntitiesMetrics;