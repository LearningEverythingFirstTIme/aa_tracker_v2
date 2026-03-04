import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import { X, Plus, Trash2, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LedgerModal({ isOpen, onClose }: LedgerModalProps) {
  const transactions = useStore((state) => state.transactions);
  const addTransaction = useStore((state) => state.addTransaction);
  const deleteTransaction = useStore((state) => state.deleteTransaction);
  const getBalance = useStore((state) => state.getBalance);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'contribution' as 'contribution' | 'expense',
    note: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await addTransaction({
        date: new Date().toISOString().split('T')[0],
        amount,
        type: formData.type,
        note: formData.note || (formData.type === 'contribution' ? 'Contribution' : 'Expense'),
      });

      setFormData({ amount: '', type: 'contribution', note: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      alert('Failed to add transaction. Please make sure you are logged in.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brutal-bg/90 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="brutal-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-brutal-text/10">
          <div>
            <h2 className="text-xl font-heading font-bold text-brutal-text">Treasury Ledger</h2>
            <p className="text-brutal-text-secondary text-sm mt-1">
              Current Balance: <span className="text-brutal-yellow font-bold">${getBalance().toFixed(2)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="p-6 border-b-2 border-brutal-text/10 bg-brutal-text/5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="eyebrow block mb-2">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-text-secondary" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-brutal-bg border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="eyebrow block mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'contribution' | 'expense' })}
                    className="w-full px-4 py-3 bg-brutal-bg border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                  >
                    <option value="contribution">Contribution</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="eyebrow block mb-2">Note</label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Optional note"
                    className="w-full px-4 py-3 bg-brutal-bg border-2 border-brutal-text/20 rounded-lg text-brutal-text placeholder:text-brutal-text-secondary focus:border-brutal-yellow focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border-2 border-brutal-text/20 rounded-lg text-brutal-text-secondary hover:border-brutal-text/40 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="brutal-btn py-2">
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transactions List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-brutal-text">Recent Transactions</h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 text-brutal-yellow hover:text-brutal-text transition-colors font-mono text-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-brutal-text-secondary text-center py-8">No transactions yet</p>
            ) : (
              transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 border-2 border-brutal-text/10 rounded-lg hover:border-brutal-text/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'contribution'
                        ? 'bg-brutal-green/20 text-brutal-green'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {t.type === 'contribution' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-brutal-text font-medium">{t.note}</p>
                      <p className="text-xs text-brutal-text-secondary font-mono">{formatDate(t.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-semibold ${
                      t.type === 'contribution' ? 'text-brutal-green' : 'text-red-400'
                    }`}>
                      {t.type === 'contribution' ? '+' : '-'}${t.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-brutal-text-secondary hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
