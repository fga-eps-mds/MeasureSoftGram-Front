import { Characteristic } from '@customTypes/preConfig';
import { PreConfigEntitiesRelationship } from '@customTypes/product';

export const mergeCharacteristicData = (
  characteristics: Characteristic[],
  entityRelationshipTree: PreConfigEntitiesRelationship[]
): Characteristic[] => {
  const characteristicKeys = characteristics.map((characteristic) => characteristic.key);

  const characteristicsToAdd = entityRelationshipTree
    .filter((characteristic) => !characteristicKeys.includes(characteristic.key))
    .map(
      (characteristic: PreConfigEntitiesRelationship): Characteristic => ({
        key: characteristic.key,
        weight: 0,
        subcharacteristics: characteristic.subcharacteristics.map((subcharacteristic) => ({
          key: subcharacteristic.key,
          weight: 0,
          measures: subcharacteristic.measures.map((measure) => ({
            key: measure.key,
            weight: 0,
            min_threshold: 0,
            max_threshold: 100
          }))
        }))
      })
    );

  return [...characteristics, ...characteristicsToAdd];
};
