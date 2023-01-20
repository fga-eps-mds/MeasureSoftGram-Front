export interface formatEntitiesMetricsType {
    results: {
        key: string;
    }[];
}

const formatEntitiesMetrics = (result: formatEntitiesMetricsType[]) => {


    console.log('result Metrics', result);

    // const metrics = result[0].results.map((r) => r.key);

    // Create an array of metrics
    const metrics = [];    

    for (let i = 0; i < result['results'].length; i++) {
        // Push the key of each result to the metrics array
        metrics.push(result['results'][i]['key']);  
    }

    console.log('metrics', metrics);

    return [metrics];
};

export default formatEntitiesMetrics;