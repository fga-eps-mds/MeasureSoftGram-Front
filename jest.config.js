process.env.NODE_ENV = 'test';

const nextJest = require('next/jest');

// Carrega o ambiente do Next.js (lê next.config.js e arquivos .env)
const createJestConfig = nextJest({
  dir: './',
});

const aliases = require('./settings/alias').reduce((acc, alias) => {
  acc[`^${alias.name}(.*)$`] = `<rootDir>${alias.path}$1`;
  return acc;
}, {});

/** @type {import('jest').Config} */
const customJestConfig = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/styles.ts',
    '!<rootDir>/src/**/index.{ts,tsx}',
    '!<rootDir>/src/**/*.page.{ts,tsx}',
    '!<rootDir>/src/**/*.next.{ts,tsx}',
    '!<rootDir>/src/mocks/**',
  ],
  testRegex: '((\\.|/*.)(spec))\\.tsx?$',

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    'styles\\.(ts|tsx)$',
    '/Theme/',
    'index\\.(page\\.)?(ts|tsx)$',
    '/_app\\.tsx$',
    '/_document\\.tsx$',
    '/mocks/'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'html', 'json'],

  testEnvironment: 'jest-environment-jsdom',

  // Localmente o Jest abria um worker por núcleo menos um, e cada worker carrega MUI, ECharts e o app: numa máquina
  // de 16 núcleos a suíte passava de 11 GB de RAM. No CI (poucos núcleos) fica o padrão.
  ...(process.env.CI ? {} : { maxWorkers: '25%' }),
  // a memória de cada worker crescia a cada arquivo de teste; passado o limite, o worker é reiniciado
  workerIdleMemoryLimit: '768MB',
  // formato de snapshot do Jest 28, para não regravar os snapshots existentes na troca para o Jest 29
  snapshotFormat: { escapeString: true, printBasicPrototype: true },


  // Carrega os arquivos de setup
  setupFilesAfterEnv: ['<rootDir>/tests/jestSetup.ts'],

  // Mapeia os aliases para os caminhos dos arquivos
  moduleNameMapper: {
    ...aliases,
    '^react$': require.resolve('react'),         
    '^react-dom$': require.resolve('react-dom'),  
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^next/image$': '<rootDir>/__mocks__/next/ImageMock.js'
  },

  reporters: [
    'default',
    [
      'jest-sonar',
      {
        outputDirectory: '.',
        outputName: 'coverage.xml'
      }
    ]
  ]
};

// O ECharts modular (echarts/core, echarts/charts...) e o zrender só existem como ESM: precisam passar pelo SWC
// como o código do projeto. O next/jest sempre ignora /node_modules/, então a troca é feita na config pronta.
const ESM_PACKAGES = '/node_modules/(?!(\\.pnpm/(echarts|zrender)@[^/]+/node_modules/)?(echarts|zrender)/)';

// Exporta a configuração combinando o padrão do Next com a configuração customizada
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = config.transformIgnorePatterns.map((pattern) =>
    pattern === '/node_modules/' ? ESM_PACKAGES : pattern
  );
  return config;
};
