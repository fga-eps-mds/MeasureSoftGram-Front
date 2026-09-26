import { getPathId } from '../pathDestructer';

describe('getPathId', () => {
  it('separa organização e id de uma string "org-id"', () => {
    expect(getPathId('org-1')).toEqual(['org', '1']);
  });

  it('retorna o segundo valor vazio quando não há separador', () => {
    expect(getPathId('apenas')).toEqual(['apenas', '']);
  });

  it('retorna ["", ""] quando o nome é uma string vazia', () => {
    expect(getPathId('')).toEqual(['', '']);
  });

  it('retorna ["", ""] quando o nome é undefined', () => {
    expect(getPathId(undefined)).toEqual(['', '']);
  });

  it('retorna ["", ""] quando o valor não é uma string', () => {
    expect(getPathId(123 as unknown as string)).toEqual(['', '']);
  });
});
