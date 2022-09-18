export interface FormatEntitiesFilterType {
  key: string;
  subcharacteristics: {
    key: string;
  }[];
}

const formatEntitiesFilter = (result: FormatEntitiesFilterType[]) => {
  const characteristics = result.map((r) => r.key);
  const subCharacteristics = result.map((r) => r.subcharacteristics.map((sub) => sub.key));

  return [characteristics, subCharacteristics.flat(1)];
};

export default formatEntitiesFilter;
