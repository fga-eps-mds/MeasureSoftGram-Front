/* eslint-disable jest/no-conditional-expect */
import { Characteristic } from '@customTypes/preConfig';
import { iterator, iteratorType } from '@pages/preConfig/utils/iterators';

const CHARACTERISTIC_KEY = 'Test-Char';
const SUBHARACTERISTIC_KEY = 'Test-Subchar';
const MEASURE_KEY = 'Test-Measure';
const WEIGHT = 100;
const GENERIC_KEY = 'generic_key';

const mockedCharacteristic: Characteristic[] = [
  {
    key: CHARACTERISTIC_KEY,
    subcharacteristics: [{ key: SUBHARACTERISTIC_KEY, weight: 30, measures: [{ key: MEASURE_KEY, weight: 20 }] }],
    weight: 20
  }
];

const ITERATORS_CONFIG = [
  { type: 'characteristic', key: CHARACTERISTIC_KEY },
  { type: 'subcharacteristic', key: SUBHARACTERISTIC_KEY },
  { type: 'measure', key: MEASURE_KEY }
];

describe('Utils', () => {
  describe.each(ITERATORS_CONFIG)('iterators', ({ type, key }) => {
    it(`Deve alterar peso quando tipo for ${type}`, () => {
      const characteristic = iterator[type as iteratorType]({
        data: mockedCharacteristic,
        weight: WEIGHT,
        key
      });

      const subcharacteristic = characteristic[0].subcharacteristics[0];
      const measure = subcharacteristic.measures[0];

      if (type === 'characteristic') expect(characteristic[0].weight).toBe(WEIGHT);
      else if (type === 'subcharacteristic') expect(subcharacteristic.weight).toBe(WEIGHT);
      else expect(measure.weight).toBe(WEIGHT);
    });

    it(`Deve manter formato caso não encontre a chave - ${type}`, () => {
      const characteristic = iterator[type as iteratorType]({
        data: mockedCharacteristic,
        weight: WEIGHT,
        key: GENERIC_KEY
      });

      const subcharacteristic = characteristic[0].subcharacteristics;
      const measure = subcharacteristic[0].measures;
      const mockedSubcharacteristic = mockedCharacteristic[0].subcharacteristics;
      const mockedMeasure = mockedSubcharacteristic[0].measures;

      if (type === 'characteristic') expect(characteristic).toMatchObject(mockedCharacteristic);
      else if (type === 'subcharacteristic') expect(subcharacteristic).toMatchObject(mockedSubcharacteristic);
      else expect(measure).toMatchObject(mockedMeasure);
    });
  });
});
