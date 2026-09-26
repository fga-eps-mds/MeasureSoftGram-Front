import { HistoryDateRange } from '@customTypes/product';

function hasValidDate(dateRange: HistoryDateRange, time: number) {
  if (dateRange.startDate == null || dateRange.endDate == null) return true;
  return time >= dateRange.startDate && time <= dateRange.endDate;
}

export type CSVFilter = {
  dateRange?: HistoryDateRange;
};

function convertToCsv(data: any[], filter: CSVFilter): string {
  const csvHeader = [
    'id',
    'key',
    'name',
    'description',
    'historyId',
    'history_characteristic_id',
    'history_value',
    'history_created_at'
  ];
  const csvData = data[0].history
    ? data.flatMap((item: any) =>
        item.history.map((historyItem: any) => ({
          id: item.id,
          key: item.key,
          name: item.name,
          description: item.description,
          historyId: historyItem.id,
          history_characteristic_id: historyItem.characteristic_id,
          history_value: historyItem.value,
          history_created_at: historyItem.created_at
        }))
      )
    : data.map((item: any) => ({
        id: item.id,
        key: item.key,
        name: item.name,
        description: item.description,
        historyId: item.latest.id,
        history_characteristic_id: item.latest.characteristic_id,
        history_value: item.latest.value,
        history_created_at: item.created_at
      }));

  const filteredCsvData = csvData.filter((data) => {
    if (filter.dateRange != undefined)
      return hasValidDate(filter.dateRange, new Date(data.history_created_at).getTime());
    return true;
  });

  const lines = [csvHeader, ...filteredCsvData.map((item: any) => csvHeader.map((key) => item[key]))];
  return lines.map((line) => line.join(',')).join('\n');
}

export default convertToCsv;
