import { IReleases, ReleasesPaginated } from '@customTypes/product';

function filterReleaseList(releases: ReleasesPaginated, name: string, startDate: string, endDate: string): IReleases[] {
  return (
    releases.results?.filter((release) => {
      const endDateObject = new Date(endDate);
      endDateObject.setUTCHours(23, 59, 59);
      const hasName = !name || release.release_name.toLowerCase().includes(name.toLowerCase());
      const isAfterStartDate = !startDate || new Date(release.start_at) >= new Date(startDate);
      const isBeforeEndDate = !endDate || new Date(release.end_at) <= endDateObject;
      return isAfterStartDate && hasName && isBeforeEndDate;
    }) || []
  );
}

export default filterReleaseList;
