import {TransactionDetails} from '../common_models/transaction.interface';

export interface DashboardInterface {
  monthlyStats?: {
    thisMonth: {
      expense: number;
      income: number;
      sum: number;
    };
    lastMonth: {
      expense: number;
      income: number;
      sum: number;
    };
  };
  lastTransactions?: TransactionDetails[];
  expenseByMainCategory?: SeriesData[];
  // expenseOfCurrentCategory?: SeriesData[];
}

export interface StatsResponse {
  thisMonth: {
    expense: number;
    income: number;
  };
  prevMonth: {
    expense: number;
    income: number;
  };
}

export interface SeriesData {
  name: string;
  value: number;
  extra?: any;
}


