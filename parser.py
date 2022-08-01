import json
import requests
import sys
import re
from datetime import datetime

TODAY = datetime.now()

METRICS_SONAR = [
    'files',
    'functions',
    'complexity',
    'coverage',
    'ncloc',
    'comment_lines_density',
    'duplicated_lines_density',
    'security_rating',
    'tests',
    'test_success_density',
    'test_execution_time',
    'reliability_rating'
]

BASE_URL = 'https://sonarcloud.io/api/measures/component_tree?component='

if __name__ == '__main__':

    REPO = sys.argv[1] # REPO name

    # Get metrics from Sonar Cloud
    response = requests.get(f'{BASE_URL}{REPO}&metricKeys={",".join(METRICS_SONAR)}&ps=500')
    j = json.loads(response.text)

    path_time = './test-results.json'
    with open(path_time, 'r') as f:
        json_time = json.loads(f.read())

    file_path = f'./{REPO}-{TODAY.strftime("%m-%d-%Y-%H:%M:%S")}.json'

    for component in j['components']:
        test = 0
        test_execution_time = 0
        for result in json_time['testResults']:
            test += 1
            test_execution_time += (result['endTime'] - result['startTime'])/1000

        component['measures'].append({ 'metric': 'test', 'value': test })
        component['measures'].append({ 'metric': 'test_execution_time', 'value': test_execution_time })

    with open(file_path, 'w+') as fp:
        fp.write(json.dumps(j))
        fp.close()
