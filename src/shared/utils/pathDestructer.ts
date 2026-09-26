export function getPathId(name?: string): [string, string] {
  if (!name || typeof name !== 'string') {
    return ['', ''];
  }

  const [first, second = ''] = name.split('-');
  return [first, second];
}
