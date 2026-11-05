import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import jest from 'eslint-plugin-jest';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-config-prettier';

// O eslint-plugin-sonarjs 3 trouxe centenas de regras ao preset `recommended`. Aqui ficam só as do `recommended` da
// versão 0.14, que o projeto já seguia (as que o projeto desligava continuam desligadas, mais abaixo).
const LEGACY_SONAR_RULES = [
  'max-switch-cases',
  'no-all-duplicated-branches',
  'no-collection-size-mischeck',
  'no-duplicated-branches',
  'no-element-overwrite',
  'no-empty-collection',
  'no-extra-arguments',
  'no-gratuitous-expressions',
  'no-identical-conditions',
  'no-identical-expressions',
  'no-inverted-boolean-check',
  'no-nested-switch',
  'no-nested-template-literals',
  'no-redundant-boolean',
  'no-redundant-jump',
  'no-same-line-conditional',
  'no-small-switch',
  'no-unused-collection',
  'no-use-of-empty-return-value',
  'no-useless-catch',
  'non-existent-operator',
  'prefer-immediate-return',
  'prefer-object-literal',
  'prefer-single-boolean-return',
  'prefer-while'
];

export default defineConfig([
  ...nextVitals,
  {
    files: ['**/*.spec.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    ...jest.configs['flat/recommended'],
    languageOptions: { globals: { ...jest.environments.globals.globals } }
  },
  prettier,
  {
    plugins: { sonarjs },
    rules: {
      ...Object.fromEntries(LEGACY_SONAR_RULES.map((rule) => [`sonarjs/${rule}`, 'error'])),
      'no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'off',
      // regras do compilador do React, novas no eslint-plugin-react-hooks 7: o código não foi escrito para elas
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/incompatible-library': 'off',
      // os specs mocam componentes com funções anônimas
      'react/display-name': 'off',
      'jest/no-alias-methods': 'off',
      'jest/no-identical-title': 'off',
      'no-console': 'off',
      'no-empty': 'off',
      eqeqeq: 'off'
    }
  },
  globalIgnores(['.next/**', 'coverage/**', 'public/**', 'node_modules/**', 'next-env.d.ts', 'src/shared/i18n/locales/**'])
]);
