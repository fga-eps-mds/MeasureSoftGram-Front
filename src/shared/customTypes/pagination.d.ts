type PaginationParams = {
  bookmark?: string;
};

type PaginatedResult<Data> = {
  result: Data;
};
