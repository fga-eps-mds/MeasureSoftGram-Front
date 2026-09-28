export const isSameGithubOrg = (
  ghNameCandidate: string | undefined, 
  dbName: string | undefined, 
  dbKey: string | undefined, 
  exactGhName?: string
) => {
  if (exactGhName && exactGhName === ghNameCandidate) {
    return true;
  }
  const gh = ghNameCandidate?.toLowerCase() || '';
  const db = dbName?.toLowerCase() || '';
  const key = dbKey?.toLowerCase() || '';
  
  if (!gh) {
    return false;
  }

  return gh === db || 
         (key && gh === key) ||
         (db.length > 3 && gh.includes(db.replace(/[^a-z0-9]/g, '-'))) ||
         (db.length > 3 && gh.includes(db.replace(/[^a-z0-9]/g, '')));
};
