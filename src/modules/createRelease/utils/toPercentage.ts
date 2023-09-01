const toPercentage = (recivedValue: string | number) => {
  const newValue = typeof recivedValue === 'number' ? recivedValue : parseInt(recivedValue, 10);

  let value = Number.isNaN(newValue) || newValue < 0 ? 0 : newValue;
  if (newValue > 100) value = 100;

  return value;
};

export default toPercentage;
