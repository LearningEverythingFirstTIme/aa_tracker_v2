import { useState, useMemo } from 'react';
import { useStore, type TreasuryTransaction } from '../store/useStore';
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TreasuryPageProps {
  onBack: () => void;
}

export function TreasuryPage({ onBack }: TreasuryPageProps) {
  const { transactions, addTransaction, deleteTransaction } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filter transactions by current month
  const monthlyTransactions = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startOfMonth && tDate <= endOfMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentMonth]);

  // Calculate monthly totals
  const monthlyStats = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === 'contribution')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [monthlyTransactions]);

  // Calculate running balance (from all transactions, not just monthly)
  const runningBalance = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let balance = 0;
    return sorted.map(t => {
      balance += t.type === 'contribution' ? t.amount : -t.amount;
      return { ...t, runningBalance: balance };
    });
  }, [transactions]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen bg-brutal-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brutal-bg border-b-2 border-brutal-text/10 px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono text-sm uppercase">Back</span>
          </button>
          
          <h1 className="font-heading font-bold text-xl text-brutal-text">Treasury</h1>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 brutal-btn py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <span className="font-heading font-bold text-2xl text-brutal-text">
              {monthNames[currentMonth.getMonth()]}
            </span>
            <span className="font-heading font-bold text-2xl text-brutal-text-secondary ml-2">
              {currentMonth.getFullYear()}
            </span>
          </div>
          
          <button
            onClick={nextMonth}
            className="p-2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="brutal-panel p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-brutal-green" />
              <span className="eyebrow">Income</span>
            </div>
            <span className="text-3xl font-heading font-bold text-brutal-green">
              ${monthlyStats.income.toFixed(2)}
            </span>
          </div>

          <div className="brutal-panel p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="eyebrow">Expenses</span>
            </div>
            <span className="text-3xl font-heading font-bold text-red-400">
              ${monthlyStats.expenses.toFixed(2)}
            </span>
          </div>

          <div className="brutal-panel p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-brutal-yellow" />
              <span className="eyebrow">Net</span>
            </div>
            <span className={`text-3xl font-heading font-bold ${
              monthlyStats.net >= 0 ? 'text-brutal-green' : 'text-red-400'
            }`}>
              ${monthlyStats.net >= 0 ? '' : '-'}${Math.abs(monthlyStats.net).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="brutal-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-brutal-text/10">
                <tr className="text-left">
                  <th className="py-4 px-4 font-mono text-xs uppercase tracking-wider text-brutal-text-secondary">Date</th>
                  <th className="py-4 px-4 font-mono text-xs uppercase tracking-wider text-brutal-text-secondary">Description</th>
                  <th className="py-4 px-4 font-mono text-xs uppercase tracking-wider text-brutal-text-secondary text-right">Income</th>
                  <th className="py-4 px-4 font-mono text-xs uppercase tracking-wider text-brutal-text-secondary text-right">Expense</th>
                  <th className="py-4 px-4 font-mono text-xs uppercase tracking-wider text-brutal-text-secondary text-right">Balance</th>
                  <th className="py-4 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {monthlyTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-brutal-text-secondary">
                      No transactions for this month
                    </td>
                  </tr>
                ) : (
                  monthlyTransactions.map((t) => {
                    const runningBal = runningBalance.find(rb => rb.id === t.id)?.runningBalance || 0;
                    return (
                      <tr key={t.id} className="border-b border-brutal-text/5 hover:bg-brutal-text/5">
                        <td className="py-4 px-4 text-sm text-brutal-text-secondary">
                          {formatDate(t.date)}
                        </td>
                        <td className="py-4 px-4 text-sm text-brutal-text">
                          {t.note}
                        </td>
                        <td className="py-4 px-4 text-sm text-right">
                          {t.type === 'contribution' ? (
                            <span className="text-brutal-green font-mono">+${t.amount.toFixed(2)}</span>
                          ) : (
                            <span className="text-brutal-text-secondary">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-right">
                          {t.type === 'expense' ? (
                            <span className="text-red-400 font-mono">-${t.amount.toFixed(2)}</span>
                          ) : (
                            <span className="text-brutal-text-secondary">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-right font-mono font-bold text-brutal-text">
                          ${runningBal.toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="text-brutal-text-secondary hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <AddEntryModal
          onClose={() => setShowAddModal(false)}
          onAdd={addTransaction}
        />
      )}
    </div>
  );
}

interface AddEntryModalProps {
  onClose: () => void;
  onAdd: (transaction: Omit<TreasuryTransaction, 'id'>) => Promise<void>;
}

function AddEntryModal({ onClose, onAdd }: AddEntryModalProps) {
  const [type, setType] = useState<'contribution' | 'expense'>('contribution');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !note) return;

    setSubmitting(true);
    await onAdd({
      date,
      amount: parseFloat(amount),
      type,
      note,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brutal-bg/90 backdrop-blur-sm" onClick={onClose} />
      
      <form 
        onSubmit={handleSubmit}
        className="brutal-panel w-full max-w-md relative z-10"
      >
        <div className="p-6 border-b-2 border-brutal-text/10">
          <h2 className="text-xl font-heading font-bold text-brutal-text">Add Entry</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('contribution')}
              className={`flex-1 py-3 px-4 border-2 rounded-lg font-mono text-sm uppercase transition-all ${
                type === 'contribution'
                  ? 'border-brutal-green bg-brutal-green/10 text-brutal-green'
                  : 'border-brutal-text/20 text-brutal-text-secondary'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-3 px-4 border-2 rounded-lg font-mono text-sm uppercase transition-all ${
                type === 'expense'
                  ? 'border-red-400 bg-red-400/10 text-red-400'
                  : 'border-brutal-text/20 text-brutal-text-secondary'
              }`}
            >
              <TrendingDown className="w-4 h-4 inline mr-2" />
              Expense
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="eyebrow block mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="eyebrow block mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brutal-text-secondary">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="eyebrow block mb-2">Description</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={type === 'contribution' ? 'Meeting contribution' : 'Rent payment'}
              className="w-full px-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="p-6 border-t-2 border-brutal-text/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border-2 border-brutal-text/20 rounded-lg text-brutal-text-secondary hover:border-brutal-text/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 brutal-btn"
          >
            {submitting ? 'Saving...' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
