
export interface AccountInfo {
  name: string;
  description: string;
  balance: number;
  readonly created: Date;
  type: 'account' | 'savings';
  isEnabled: boolean;
  readonly id: number;
}
