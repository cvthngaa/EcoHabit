import { mockUser, mockTransactions, WalletTransaction } from './mockData';

// ── Wallet State ──────────────────────────────────────────────────────────────

let _balance = mockUser.totalPoints;
let _transactions = [...mockTransactions];

export function getBalance(): number {
  return _balance;
}

export function getTransactions(filter?: 'all' | 'earn' | 'spend'): WalletTransaction[] {
  if (!filter || filter === 'all') return _transactions;
  return _transactions.filter(t => t.type === filter);
}

export function earnPoints(amount: number, description: string, icon: string = 'star'): WalletTransaction {
  _balance += amount;
  const tx: WalletTransaction = {
    id: `t${Date.now()}`,
    type: 'earn',
    amount,
    description,
    date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    icon,
    category: 'scan',
  };
  _transactions = [tx, ..._transactions];
  return tx;
}

export function spendPoints(amount: number, description: string): { success: boolean; transaction?: WalletTransaction; error?: string } {
  if (amount > _balance) {
    return { success: false, error: 'Không đủ điểm' };
  }
  _balance -= amount;
  const tx: WalletTransaction = {
    id: `t${Date.now()}`,
    type: 'spend',
    amount,
    description,
    date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    icon: 'gift',
    category: 'redeem',
  };
  _transactions = [tx, ..._transactions];
  return { success: true, transaction: tx };
}

export function resetWallet(): void {
  _balance = mockUser.totalPoints;
  _transactions = [...mockTransactions];
}
