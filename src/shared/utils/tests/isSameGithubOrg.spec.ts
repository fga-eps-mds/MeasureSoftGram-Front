import { isSameGithubOrg } from '../isSameGithubOrg';

describe('isSameGithubOrg utility function', () => {
  it('should return true if exactGhName matches ghNameCandidate perfectly', () => {
    // Simulando o cenário onde a organização tem o campo github_org_name preenchido no BD
    expect(isSameGithubOrg('fga-eps-mds', 'MeasureSoftGram', 'msg', 'fga-eps-mds')).toBe(true);
  });

  it('should return false if exactGhName does not match and other fallbacks fail', () => {
    expect(isSameGithubOrg('outra-org', 'MeasureSoftGram', 'msg', 'fga-eps-mds')).toBe(false);
  });

  it('should return true if ghNameCandidate matches dbName ignoring case', () => {
    // dbName: 'MeasureSoftGram', ghName: 'measuresoftgram'
    expect(isSameGithubOrg('measuresoftgram', 'MeasureSoftGram', 'msg')).toBe(true);
  });

  it('should return true if ghNameCandidate matches dbKey ignoring case', () => {
    // dbKey: 'fga-eps', ghName: 'FGA-EPS'
    expect(isSameGithubOrg('FGA-EPS', 'Algum Nome', 'fga-eps')).toBe(true);
  });

  it('should handle undefined parameters gracefully and return false', () => {
    expect(isSameGithubOrg(undefined, undefined, undefined)).toBe(false);
  });

  it('should return true for fuzzy matching when dbName is longer than 3 characters and stripped of special chars', () => {
    // ghNameCandidate: 'my-org-test-2026', dbName: 'My Org Test 2026'
    // dbName replaced string becomes 'my-org-test-2026' which is included in ghNameCandidate
    expect(isSameGithubOrg('my-org-test-2026', 'My Org Test 2026', '')).toBe(true);
  });

  it('should return true for fuzzy matching when dbName is stripped of spaces entirely', () => {
    // dbName replaced string becomes 'myorgtest2026' which is included in ghNameCandidate
    expect(isSameGithubOrg('myorgtest2026', 'My Org Test 2026', '')).toBe(true);
  });

  it('should return false for fuzzy matching when dbName is 3 characters or shorter', () => {
    // O fuzzy match exige dbName.length > 3
    expect(isSameGithubOrg('abc-def', 'Abc', '')).toBe(false);
  });
});
