
export interface Account {
  name: string;
  description: string;
  balance: number;
  created: Date;
  type: "account" | "savings";
  isEnabled: boolean;
}
