export interface FormatEntitiesFilterType {
  key: string;
  subcharacteristics: {
    key: string;
    measures: {
      key: string;
    }[];
  }[];
}

const formatEntitiesFilter = (result: FormatEntitiesFilterType[]) => {

  console.log('result', result);

  const characteristics = result.map((r) => r.key);
  const subCharacteristics = result.map((r) => r.subcharacteristics.map((sub) => sub.key));
  const measures = result.map((r) => r.subcharacteristics.map((sub) => sub.measures.map((m) => m.key)));

  // console.log('characteristics', characteristics);
  // console.log('subCharacteristics', subCharacteristics.flat(1));
  console.log('measures', measures);

  return [characteristics, subCharacteristics.flat(1), measures.flat(2)];
};

export default formatEntitiesFilter;
