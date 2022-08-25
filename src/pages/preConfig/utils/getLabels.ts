import { Data } from '@customTypes/preConfig';

export const getCharacteristicsLabels = (data: Data) =>
  data.characteristics.map((characteristic) => characteristic.key);

export const getSubCharacteristicsLabels = (data: Data) => {
  const labels: string[] = [];
  data.characteristics.forEach((characteristic) =>
    characteristic.subcharacteristics.forEach((subCharacteristic) => {
      labels.push(subCharacteristic.key);
    })
  );

  return labels;
};
