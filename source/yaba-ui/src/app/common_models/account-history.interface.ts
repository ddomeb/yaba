
export interface SeriesData {
  value: number;
  name: Date;
}

export interface AccountHistory {
  name: string;
  series: Array<SeriesData>;
}
