type ThresholdInfo = {
  key: string;
  label: string;
  description: string;
  minFixed: boolean;
  maxFixed: boolean;
  step: number;
  range: (number | undefined)[];
};

const thresholdInfo: ThresholdInfo[] = [
  {
    key: 'passed_tests',
    label: 'Testes passados',
    description: 'min fixo em 0, max fixo em 1',
    minFixed: true,
    maxFixed: true,
    step: 0.1,
    range: [0, 1]
  },
  {
    key: 'test_coverage',
    label: 'Cobertura',
    description: 'min entre 0-99, max fixo em 100',
    minFixed: false,
    maxFixed: true,
    step: 1,
    range: [0, 100]
  },
  {
    key: 'test_builds',
    label: 'Fast test time',
    description: 'min fixo em 0, max entre 0-infinito',
    minFixed: true,
    maxFixed: false,
    step: 1,
    range: [0, undefined]
  },
  {
    key: 'commented_file_density',
    label: 'Densidade de comentários',
    description: 'min entre 0-100, max entre 0-100',
    minFixed: false,
    maxFixed: false,
    step: 0.5,
    range: [0, 100]
  },
  {
    key: 'duplication_absense',
    label: 'Linhas duplicadas',
    description: 'min fixo em 0, max entre 0-100',
    minFixed: true,
    maxFixed: false,
    step: 0.5,
    range: [0, 100]
  },
  {
    key: 'non_complex_file_density',
    label: 'Densidade de arquivos complexos',
    description: 'min fixo em 0, max entre 0-infinito',
    minFixed: true,
    maxFixed: false,
    step: 1,
    range: [0, undefined]
  }
];

function getThresholdInfo(key: string): ThresholdInfo | undefined {
  return thresholdInfo.find((ti) => ti.key === key);
}

export default getThresholdInfo;
