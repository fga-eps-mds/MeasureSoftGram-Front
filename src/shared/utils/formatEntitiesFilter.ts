interface Result {
  key: string;
  subcharacteristics: Array<{
    key: string;
  }>;
}

const formatEntitiesFilter = (result: Result[]) => {
  const characteristics = result.map((r) => r.key);
  const subCharacteristics = result.map((r) => r.subcharacteristics.map((sub) => sub.key));

  return [characteristics, subCharacteristics.flat(1)];
};

export default formatEntitiesFilter;
