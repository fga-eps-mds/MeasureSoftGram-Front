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
  
  const characteristics = result.map((r) => r.key);
  const subCharacteristics = result.map((r) => r.subcharacteristics.map((sub) => sub.key));
  const measures = result.map((r) => r.subcharacteristics.map((sub) => sub.measures.map((m) => m.key)));

  return [characteristics, subCharacteristics.flat(1), measures.flat(2)];
};

export default formatEntitiesFilter;
