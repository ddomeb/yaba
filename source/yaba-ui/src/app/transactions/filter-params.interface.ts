
export interface FilterParams {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  accountId: string | undefined;
  mainCategoryId: string | undefined;
  subcategoryId: string | undefined;
  direction: 'in' | 'out' | undefined;
}
