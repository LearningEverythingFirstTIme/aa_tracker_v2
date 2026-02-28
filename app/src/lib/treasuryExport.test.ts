import { describe, it, expect } from 'vitest';
import {
  generateTreasuryReport,
  generateTreasuryCsv,
  getCurrentMonthRange,
  getPreviousMonthRange,
  getYearToDateRange,
  getAllTimeRange,
  escapeCsvValue,
} from './treasuryExport';
import type { TreasuryTransaction } from '../store/useStore';

describe('treasuryExport', () => {
  const mockTransactions: TreasuryTransaction[] = [
    { id: '1', date: '2024-01-15', amount: 100, type: 'contribution', note: 'Meeting donation' },
    { id: '2', date: '2024-01-20', amount: 50, type: 'expense', note: 'Coffee' },
    { id: '3', date: '2024-02-10', amount: 200, type: 'contribution', note: 'Monthly dues' },
    { id: '4', date: '2024-02-15', amount: 75, type: 'expense', note: 'Rent' },
    { id: '5', date: '2024-02-20', amount: 150, type: 'contribution', note: 'Meeting donation' },
  ];

  describe('generateTreasuryReport', () => {
    it('should calculate beginning balance correctly', () => {
      const report = generateTreasuryReport(mockTransactions, '2024-02-01', '2024-02-29');
      // Beginning balance should be 100 - 50 = 50 (from January transactions)
      expect(report.beginningBalance).toBe(50);
    });

    it('should filter transactions by date range', () => {
      const report = generateTreasuryReport(mockTransactions, '2024-02-01', '2024-02-29');
      expect(report.incomeTransactions).toHaveLength(2);
      expect(report.expenseTransactions).toHaveLength(1);
    });

    it('should calculate ending balance correctly', () => {
      const report = generateTreasuryReport(mockTransactions, '2024-02-01', '2024-02-29');
      // Beginning: 50, Income: 350, Expenses: 75, Ending: 325
      expect(report.endingBalance).toBe(325);
    });

    it('should calculate net change correctly', () => {
      const report = generateTreasuryReport(mockTransactions, '2024-02-01', '2024-02-29');
      // Income: 350, Expenses: 75, Net: 275
      expect(report.netChange).toBe(275);
    });

    it('should group transactions by category', () => {
      const report = generateTreasuryReport(mockTransactions, '2024-01-01', '2024-12-31');
      expect(report.categoryTotals['Meeting donation']).toEqual({ income: 250, expense: 0 });
      expect(report.categoryTotals['Coffee']).toEqual({ income: 0, expense: 50 });
      expect(report.categoryTotals['Monthly dues']).toEqual({ income: 200, expense: 0 });
      expect(report.categoryTotals['Rent']).toEqual({ income: 0, expense: 75 });
    });

    it('should handle empty transactions', () => {
      const report = generateTreasuryReport([], '2024-01-01', '2024-12-31');
      expect(report.beginningBalance).toBe(0);
      expect(report.endingBalance).toBe(0);
      expect(report.netChange).toBe(0);
      expect(report.incomeTransactions).toHaveLength(0);
      expect(report.expenseTransactions).toHaveLength(0);
    });
  });

  describe('generateTreasuryCsv', () => {
    it('should generate CSV with all sections', () => {
      const report = generateTreasuryReport(mockTransactions, '2024-02-01', '2024-02-29');
      const csv = generateTreasuryCsv(report);
      
      expect(csv).toContain('AA TRACKER - TREASURY REPORT');
      expect(csv).toContain('SUMMARY');
      expect(csv).toContain('CATEGORY TOTALS');
      expect(csv).toContain('INCOME TRANSACTIONS');
      expect(csv).toContain('EXPENSE TRANSACTIONS');
    });

    it('should include correct summary values', () => {
      const report = generateTreasuryReport(mockTransactions, '2024-02-01', '2024-02-29');
      const csv = generateTreasuryCsv(report);
      
      expect(csv).toContain('Beginning Balance');
      expect(csv).toContain('50.00');
      expect(csv).toContain('Ending Balance');
      expect(csv).toContain('325.00');
    });

    it('should include transaction details', () => {
      const report = generateTreasuryReport(mockTransactions, '2024-02-01', '2024-02-29');
      const csv = generateTreasuryCsv(report);
      
      expect(csv).toContain('Monthly dues');
      expect(csv).toContain('200.00');
      expect(csv).toContain('Rent');
      expect(csv).toContain('75.00');
    });
  });

  describe('escapeCsvValue', () => {
    it('should return simple values as-is', () => {
      expect(escapeCsvValue('hello')).toBe('hello');
      expect(escapeCsvValue(123)).toBe('123');
    });

    it('should escape values with commas', () => {
      expect(escapeCsvValue('hello, world')).toBe('"hello, world"');
    });

    it('should escape values with quotes', () => {
      expect(escapeCsvValue('say "hello"')).toBe('"say ""hello"""');
    });

    it('should escape values with newlines', () => {
      expect(escapeCsvValue('line1\nline2')).toBe('"line1\nline2"');
    });
  });

  describe('getCurrentMonthRange', () => {
    it('should return valid date strings', () => {
      const range = getCurrentMonthRange();
      expect(range.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getPreviousMonthRange', () => {
    it('should return valid date strings', () => {
      const range = getPreviousMonthRange();
      expect(range.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getYearToDateRange', () => {
    it('should start from January 1st', () => {
      const range = getYearToDateRange();
      expect(range.startDate).toMatch(/^\d{4}-01-01$/);
      expect(range.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getAllTimeRange', () => {
    it('should return first transaction date when transactions exist', () => {
      const range = getAllTimeRange(mockTransactions);
      expect(range.startDate).toBe('2024-01-15');
    });

    it('should return today when no transactions exist', () => {
      const range = getAllTimeRange([]);
      const today = new Date().toISOString().split('T')[0];
      expect(range.startDate).toBe(today);
      expect(range.endDate).toBe(today);
    });
  });
});