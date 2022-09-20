export function getPathId(name: string) {
  const nameArray = name.split('-');
  return [nameArray[0], nameArray[1]];
}
