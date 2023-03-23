const handleMetric = (filteredItem, charc, subCharc, measure) => {
  const newFilteredItem = { ...filteredItem };
  Object.keys(tree[charc][subCharc][measure]).forEach((metric) => {
    newFilteredItem[metric] = false;
  });
  return newFilteredItem;
};

export default handleMetric;
