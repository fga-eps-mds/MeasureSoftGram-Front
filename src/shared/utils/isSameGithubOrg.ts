export function isSameGithubOrg(
  githubLoginOrName: string | undefined | null,
  dbOrg: { name?: string; key?: string } | undefined | null
): boolean {
  if (!githubLoginOrName || !dbOrg) return false;
  const gh = githubLoginOrName.trim().toLowerCase();
  const dbName = (dbOrg.name || '').trim().toLowerCase();
  const dbKey = (dbOrg.key || '').trim().toLowerCase();

  return gh === dbName || (dbKey.length > 0 && gh === dbKey);
}

export default isSameGithubOrg;
