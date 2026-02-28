import type { TreasuryTransaction } from '../store/useStore';

export interface TreasuryReport {
  startDate: string;
  endDate: string;
  beginningBalance: number;
  endingBalance: number;
  netChange: number;
  incomeTransactions: TreasuryTransaction[];
  expenseTransactions: TreasuryTransaction[];
  categoryTotals: Record<string, { income: number; expense: number }>;
}

/**
 * Generates a treasury report for a given date range
 */
export function generateTreasuryReport(
  transactions: TreasuryTransaction[],
  startDate: string,
  endDate: string
): TreasuryReport {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate beginning balance (all transactions before start date)
  const beginningBalance = sortedTransactions
    .filter((t) => new Date(t.date) < new Date(startDate))
    .reduce((sum, t) => {
      return t.type === 'contribution' ? sum + t.amount : sum - t.amount;
    }, 0);

  // Filter transactions within date range
  const rangeTransactions = sortedTransactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= new Date(startDate) && tDate <= new Date(endDate);
  });

  // Separate income and expense transactions
  const incomeTransactions = rangeTransactions.filter((t) => t.type === 'contribution');
  const expenseTransactions = rangeTransactions.filter((t) => t.type === 'expense');

  // Calculate totals
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netChange = totalIncome - totalExpenses;
  const endingBalance = beginningBalance + netChange;

  // Calculate category totals (grouped by note/type)
  const categoryTotals: Record<string, { income: number; expense: number }> = {};
  
  // Group by transaction note as category
  rangeTransactions.forEach((t) => {
    const category = t.note || 'Uncategorized';
    if (!categoryTotals[category]) {
      categoryTotals[category] = { income: 0, expense: 0 };
    }
    if (t.type === 'contribution') {
      categoryTotals[category].income += t.amount;
    } else {
      categoryTotals[category].expense += t.amount;
    }
  });

  return {
    startDate,
    endDate,
    beginningBalance,
    endingBalance,
    netChange,
    incomeTransactions,
    expenseTransactions,
    categoryTotals,
  };
}

/**
 * Formats a date string for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Escapes a CSV value to handle commas, quotes, and newlines
 */
function escapeCsvValue(value: string | number): string {
  const str = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates CSV content from a treasury report
 */
export function generateTreasuryCsv(report: TreasuryReport): string {
  const lines: string[] = [];

  // Header section
  lines.push('AA TRACKER - TREASURY REPORT');
  lines.push(`Report Period:,${formatDate(report.startDate)} to ${formatDate(report.endDate)}`);
  lines.push(`Generated:,${new Date().toLocaleString()}`);
  lines.push('');

  // Summary section
  lines.push('SUMMARY');
  lines.push(`Beginning Balance,${escapeCsvValue(report.beginningBalance.toFixed(2))}`);
  lines.push(`Total Income,${escapeCsvValue(report.incomeTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2))}`);
  lines.push(`Total Expenses,${escapeCsvValue(report.expenseTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2))}`);
  lines.push(`Net Change,${escapeCsvValue(report.netChange.toFixed(2))}`);
  lines.push(`Ending Balance,${escapeCsvValue(report.endingBalance.toFixed(2))}`);
  lines.push('');

  // Category totals section
  lines.push('CATEGORY TOTALS');
  lines.push('Category,Income,Expenses,Net');
  Object.entries(report.categoryTotals).forEach(([category, totals]) => {
    const net = totals.income - totals.expense;
    lines.push(
      `${escapeCsvValue(category)},${escapeCsvValue(totals.income.toFixed(2))},${escapeCsvValue(totals.expense.toFixed(2))},${escapeCsvValue(net.toFixed(2))}`
    );
  });
  lines.push('');

  // Income transactions section
  lines.push('INCOME TRANSACTIONS');
  lines.push('Date,Amount,Description');
  if (report.incomeTransactions.length === 0) {
    lines.push('No income transactions for this period');
  } else {
    report.incomeTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((t) => {
        lines.push(
          `${formatDate(t.date)},${escapeCsvValue(t.amount.toFixed(2))},${escapeCsvValue(t.note)}`
        );
      });
  }
  lines.push('');

  // Expense transactions section
  lines.push('EXPENSE TRANSACTIONS');
  lines.push('Date,Amount,Description');
  if (report.expenseTransactions.length === 0) {
    lines.push('No expense transactions for this period');
  } else {
    report.expenseTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((t) => {
        lines.push(
          `${formatDate(t.date)},${escapeCsvValue(t.amount.toFixed(2))},${escapeCsvValue(t.note)}`
        );
      });
  }

  return lines.join('\n');
}

/**
 * Triggers a download of the CSV file
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Gets the current month's date range
 */
export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Gets the previous month's date range
 */
export function getPreviousMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Gets year-to-date range
 */
export function getYearToDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
  };
}

/**
 * Gets all-time range (from first transaction to today)
 */
export function getAllTimeRange(transactions: TreasuryTransaction[]): { startDate: string; endDate: string } {
  if (transactions.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    return { startDate: today, endDate: today };
  }
  
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return {
    startDate: sorted[0].date,
    endDate: new Date().toISOString().split('T')[0],
  };
}