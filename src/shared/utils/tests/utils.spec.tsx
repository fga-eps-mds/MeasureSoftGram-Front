import capitalizer from '@utils/capitalizer';
import undelineRemover from '@utils/undelineRemover';

const LOWER_STRING_WITHOUT_UNDERLINE = 'test utils';
const LOWER_STRING = 'test_utils';
const CAPITAL_STRING = 'Test_utils';

describe('Utils', () => {
  describe('capitalizer', () => {
    it('Deve tornar primeira letra em caixa alta', () => {
      expect(capitalizer(LOWER_STRING)).toBe(CAPITAL_STRING);
    });
  });
  describe('underlineRemover', () => {
    it('Deve remover _', () => {
      expect(undelineRemover(LOWER_STRING)).toBe(LOWER_STRING_WITHOUT_UNDERLINE);
    });
  });
});
