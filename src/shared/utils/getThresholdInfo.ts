interface ThresholdInfo {
  key: string;
  description: string;
  minFixed: boolean;
  maxFixed: boolean;
}

const thresholdInfo: ThresholdInfo[] = [
  {
    key: 'passed_tests',
    description: '',
    minFixed: true,
    maxFixed: true
  },
  {
    key: 'test_coverage',
    description: '',
    minFixed: false,
    maxFixed: true
  },
  {
    key: 'ci_feedback_time',
    description: '',
    minFixed: true,
    maxFixed: true
  },
  {
    key: 'non_complex_file_density',
    description: '',
    minFixed: true,
    maxFixed: false
  },
  {
    key: 'duplication_absense',
    description: '',
    minFixed: true,
    maxFixed: false
  },
  {
    key: 'passed_tests',
    description: '',
    minFixed: true,
    maxFixed: true
  },
  {
    key: 'team_throughput',
    description: '',
    minFixed: true,
    maxFixed: true
  }
];

export default thresholdInfo;
