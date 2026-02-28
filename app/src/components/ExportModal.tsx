import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  generateTreasuryReport, 
  generateTreasuryCsv, 
  downloadCsv,
  getCurrentMonthRange,
  getPreviousMonthRange,
  getYearToDateRange,
  getAllTimeRange,
} from '../lib/treasuryExport';
import { 
  X, 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Check
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DateRangeOption = 'current-month' | 'previous-month' | 'ytd' | 'all-time' | 'custom';

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const transactions = useStore((state) => state.transactions);
  
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>('current-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const getDateRange = (): { startDate: string; endDate: string } => {
    switch (selectedRange) {
      case 'current-month':
        return getCurrentMonthRange();
      case 'previous-month':
        return getPreviousMonthRange();
      case 'ytd':
        return getYearToDateRange();
      case 'all-time':
        return getAllTimeRange(transactions);
      case 'custom':
        return {
          startDate: customStartDate || new Date().toISOString().split('T')[0],
          endDate: customEndDate || new Date().toISOString().split('T')[0],
        };
      default:
        return getCurrentMonthRange();
    }
  };

  const handleExport = async () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    setIsExporting(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { startDate, endDate } = getDateRange();
    const report = generateTreasuryReport(transactions, startDate, endDate);
    const csvContent = generateTreasuryCsv(report);
    
    const startStr = startDate.replace(/-/g, '');
    const endStr = endDate.replace(/-/g, '');
    const filename = `aa-treasury-report_${startStr}_to_${endStr}.csv`;
    
    downloadCsv(csvContent, filename);
    
    setIsExporting(false);
    setExportSuccess(true);
    
    // Reset success state after 2 seconds
    setTimeout(() => {
      setExportSuccess(false);
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const rangeOptions: { value: DateRangeOption; label: string; description: string }[] = [
    { 
      value: 'current-month', 
      label: 'Current Month', 
      description: 'Export transactions from this month' 
    },
    { 
      value: 'previous-month', 
      label: 'Previous Month', 
      description: 'Export transactions from last month' 
    },
    { 
      value: 'ytd', 
      label: 'Year to Date', 
      description: 'Export all transactions this year' 
    },
    { 
      value: 'all-time', 
      label: 'All Time', 
      description: 'Export all transactions ever recorded' 
    },
    { 
      value: 'custom', 
      label: 'Custom Range', 
      description: 'Select your own date range' 
    },
  ];

  const { startDate, endDate } = getDateRange();
  const previewReport = generateTreasuryReport(transactions, startDate, endDate);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brutal-bg/90 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="brutal-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-brutal-text/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brutal-yellow/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-brutal-yellow" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-brutal-text">Export Treasury Report</h2>
              <p className="text-brutal-text-secondary text-sm">Download your financial data as CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range Selection */}
          <div>
            <label className="eyebrow block mb-3">Select Date Range</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedRange(option.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedRange === option.value
                      ? 'border-brutal-yellow bg-brutal-yellow/10'
                      : 'border-brutal-text/20 hover:border-brutal-text/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      selectedRange === option.value ? 'text-brutal-yellow' : 'text-brutal-text'
                    }`}>
                      {option.label}
                    </span>
                    {selectedRange === option.value && (
                      <Check className="w-4 h-4 text-brutal-yellow" />
                    )}
                  </div>
                  <p className="text-xs text-brutal-text-secondary mt-1">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {selectedRange === 'custom' && (
            <div className="p-4 border-2 border-brutal-text/10 rounded-lg bg-brutal-text/5">
              <label className="eyebrow block mb-3">Custom Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-brutal-text-secondary block mb-2">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-text-secondary" />
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-brutal-bg border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-brutal-text-secondary block mb-2">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-text-secondary" />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-brutal-bg border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="p-4 border-2 border-brutal-text/10 rounded-lg">
            <label className="eyebrow block mb-3">Report Preview</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brutal-green/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-brutal-green" />
                </div>
                <div>
                  <p className="text-xs text-brutal-text-secondary">Income</p>
                  <p className="text-sm font-mono text-brutal-green">
                    ${previewReport.incomeTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-brutal-text-secondary">Expenses</p>
                  <p className="text-sm font-mono text-red-400">
                    ${previewReport.expenseTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brutal-yellow/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-brutal-yellow" />
                </div>
                <div>
                  <p className="text-xs text-brutal-text-secondary">Transactions</p>
                  <p className="text-sm font-mono text-brutal-text">
                    {previewReport.incomeTransactions.length + previewReport.expenseTransactions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brutal-violet/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-brutal-violet" />
                </div>
                <div>
                  <p className="text-xs text-brutal-text-secondary">Period</p>
                  <p className="text-sm font-mono text-brutal-text">
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CSV Info */}
          <div className="text-xs text-brutal-text-secondary space-y-1">
            <p>The exported CSV will include:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Beginning and ending balance</li>
              <li>All income and expense transactions</li>
              <li>Category totals grouped by description</li>
              <li>Net change calculation</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-brutal-text/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-brutal-text/20 rounded-lg text-brutal-text-secondary hover:border-brutal-text/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || exportSuccess || transactions.length === 0}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              exportSuccess
                ? 'bg-brutal-green text-brutal-bg border-2 border-brutal-green'
                : 'brutal-btn'
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-brutal-bg/30 border-t-brutal-bg rounded-full animate-spin" />
                Exporting...
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Exported!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}