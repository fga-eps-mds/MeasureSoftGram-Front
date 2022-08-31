import { Characteristic, Subcharacteristic } from '@customTypes/preConfig';

const characteristic = (data: Characteristic[], callBack: Function) =>
  data.map((characterValue) => callBack(characterValue));

const subcharacteristic = (data: Characteristic[], callBack: Function) =>
  characteristic(data, (characterValue: Characteristic) =>
    characterValue.subcharacteristics.map((subCharacterValue) => callBack(subCharacterValue, characterValue))
  );

const measure = (data: Characteristic[], callBack: Function) =>
  subcharacteristic(data, (subCharacterValue: Subcharacteristic) =>
    subCharacterValue.measures.map((measureValue) => callBack(measureValue, subCharacterValue))
  );

export const componentIterator = {
  characteristic,
  subcharacteristic,
  measure
};

export type componentIteratorType = keyof typeof componentIterator;
