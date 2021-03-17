
export interface AccountInfo {
  name: string;
  description: string;
  balance: number;
  created: Date;
  type: 'account' | 'savings';
  isEnabled: boolean;
  id: number;
}
