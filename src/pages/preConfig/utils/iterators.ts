import { Characteristic } from '@customTypes/preConfig';

interface IteratorType {
  data: Characteristic[];
  key: string;
  weight: number;
}

const characteristic = ({ data, key, weight }: IteratorType) =>
  data.map((charValue) => (charValue.key === key ? { ...charValue, weight } : charValue));

const subcharacteristic = ({ data, key, weight }: IteratorType) =>
  data.map((charValue) => ({
    ...charValue,
    subcharacteristics: charValue.subcharacteristics.map((subCharValue) =>
      subCharValue.key === key ? { ...subCharValue, weight } : subCharValue
    )
  }));

const measure = ({ data, key, weight }: IteratorType) =>
  data.map((charValue) => ({
    ...charValue,
    subcharacteristics: charValue.subcharacteristics.map((subCharValue) => ({
      ...subCharValue,
      measures: subCharValue.measures.map((measureValue) =>
        measureValue.key === key ? { ...measureValue, weight } : measureValue
      )
    }))
  }));

export const iterator = {
  measure,
  characteristic,
  subcharacteristic
};

export type iteratorType = keyof typeof iterator;
