import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Meeting {
  id: string;
  name: string;
  day: string;
  time: string;
  location: string;
  type: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  meeting: string;
  role: 'Attendee' | 'Speaker' | 'Secretary' | 'Treasurer' | 'Host';
}

export interface TreasuryTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'contribution' | 'expense';
  note: string;
}

export interface CheckIn {
  id: string;
  date: string;
  meetingId: string;
  meetingName: string;
}

interface StoreState {
  // Auth
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Data
  meetings: Meeting[];
  history: HistoryItem[];
  transactions: TreasuryTransaction[];
  checkIns: CheckIn[];

  // Streak
  currentStreak: number;
  longestStreak: number;

  // Actions - Meetings
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;

  // Actions - History
  addHistoryItem: (item: Omit<HistoryItem, 'id'>) => void;
  updateHistoryItem: (id: string, item: Partial<HistoryItem>) => void;
  deleteHistoryItem: (id: string) => void;

  // Actions - Treasury
  addTransaction: (transaction: Omit<TreasuryTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getBalance: () => number;
  getAverageContribution: () => number;

  // Actions - Check-ins
  checkIn: (meetingId: string, meetingName: string) => void;
  canCheckInToday: () => boolean;
  getAttendedThisWeek: () => number;
  getTotalCheckIns: () => number;
  getLastCheckIn: () => string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const getToday = () => new Date().toISOString().split('T')[0];

const getWeekDays = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const calculateStreak = (checkIns: CheckIn[]): { current: number; longest: number } => {
  if (checkIns.length === 0) return { current: 0, longest: 0 };
  
  const sortedDates = [...new Set(checkIns.map(c => c.date))].sort().reverse();
  
  let current = 0;
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Check if checked in today or yesterday to maintain streak
  const lastCheckIn = sortedDates[0];
  if (lastCheckIn === today || lastCheckIn === yesterdayStr) {
    current = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  let longest = 0;
  let tempStreak = 1;
  const allDates = [...new Set(checkIns.map(c => c.date))].sort();
  
  for (let i = 1; i < allDates.length; i++) {
    const prev = new Date(allDates[i - 1]);
    const curr = new Date(allDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
    } else {
      longest = Math.max(longest, tempStreak);
      tempStreak = 1;
    }
  }
  longest = Math.max(longest, tempStreak);
  
  return { current, longest };
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      user: null,
      login: (email: string, password: string) => {
        // Simple auth - in production, use proper authentication
        if (email && password.length >= 4) {
          set({ isAuthenticated: true, user: { name: 'Member', email } });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },

      // Initial data
      meetings: [
        { id: '1', name: 'Sparta Open Speaker', day: 'Thursday', time: '8:00 PM', location: 'Sparta United Methodist Church', type: 'Speaker' },
        { id: '2', name: 'Friday Night Lights', day: 'Friday', time: '7:30 PM', location: 'Community Center', type: 'Open Discussion' },
        { id: '3', name: 'Saturday Big Book', day: 'Saturday', time: '9:00 AM', location: 'Library Room B', type: 'Literature Study' },
        { id: '4', name: 'Sunday Reflection', day: 'Sunday', time: '10:00 AM', location: "St. Mary's Hall", type: 'Step Study' },
      ],
      history: [
        { id: '1', date: '2026-02-18', meeting: "Jim's Firepit Meeting", role: 'Attendee' },
        { id: '2', date: '2026-02-16', meeting: 'Stanhope Big Book', role: 'Attendee' },
        { id: '3', date: '2026-02-13', meeting: 'Thursday Speaker', role: 'Attendee' },
        { id: '4', date: '2026-02-10', meeting: 'Sunday Reflection', role: 'Attendee' },
        { id: '5', date: '2026-02-07', meeting: 'Friday Night Lights', role: 'Speaker' },
        { id: '6', date: '2026-02-04', meeting: 'Sparta Open Speaker', role: 'Attendee' },
        { id: '7', date: '2026-02-01', meeting: 'Saturday Big Book', role: 'Attendee' },
        { id: '8', date: '2026-01-29', meeting: 'Wednesday Wisdom', role: 'Attendee' },
      ],
      transactions: [
        { id: '1', date: '2026-02-18', amount: 5, type: 'contribution', note: 'Regular meeting' },
        { id: '2', date: '2026-02-16', amount: 3, type: 'contribution', note: 'Big Book study' },
        { id: '3', date: '2026-02-13', amount: 5, type: 'contribution', note: 'Speaker meeting' },
        { id: '4', date: '2026-02-10', amount: 5, type: 'contribution', note: 'Sunday meeting' },
      ],
      checkIns: [
        { id: '1', date: '2026-02-18', meetingId: '1', meetingName: "Jim's Firepit Meeting" },
        { id: '2', date: '2026-02-16', meetingId: '2', meetingName: 'Stanhope Big Book' },
        { id: '3', date: '2026-02-13', meetingId: '3', meetingName: 'Thursday Speaker' },
        { id: '4', date: '2026-02-10', meetingId: '4', meetingName: 'Sunday Reflection' },
      ],

      currentStreak: 12,
      longestStreak: 28,

      // Meeting actions
      addMeeting: (meeting) => {
        const newMeeting = { ...meeting, id: generateId() };
        set((state) => ({ meetings: [...state.meetings, newMeeting] }));
      },
      updateMeeting: (id, updates) => {
        set((state) => ({
          meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
      },
      deleteMeeting: (id) => {
        set((state) => ({
          meetings: state.meetings.filter((m) => m.id !== id),
        }));
      },

      // History actions
      addHistoryItem: (item) => {
        const newItem = { ...item, id: generateId() };
        set((state) => ({ history: [newItem, ...state.history] }));
      },
      updateHistoryItem: (id, updates) => {
        set((state) => ({
          history: state.history.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },
      deleteHistoryItem: (id) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },

      // Treasury actions
      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: generateId() };
        set((state) => ({ transactions: [newTransaction, ...state.transactions] }));
      },
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      getBalance: () => {
        const { transactions } = get();
        return transactions.reduce((sum, t) => {
          return t.type === 'contribution' ? sum + t.amount : sum - t.amount;
        }, 0);
      },
      getAverageContribution: () => {
        const { transactions } = get();
        const contributions = transactions.filter((t) => t.type === 'contribution');
        if (contributions.length === 0) return 0;
        const total = contributions.reduce((sum, t) => sum + t.amount, 0);
        return total / contributions.length;
      },

      // Check-in actions
      checkIn: (meetingId, meetingName) => {
        const today = getToday();
        const newCheckIn = {
          id: generateId(),
          date: today,
          meetingId,
          meetingName,
        };
        set((state) => {
          const newCheckIns = [newCheckIn, ...state.checkIns];
          const { current, longest } = calculateStreak(newCheckIns);
          return {
            checkIns: newCheckIns,
            currentStreak: current,
            longestStreak: longest,
          };
        });
      },
      canCheckInToday: () => {
        const { checkIns } = get();
        const today = getToday();
        return !checkIns.some((c) => c.date === today);
      },
      getAttendedThisWeek: () => {
        const { checkIns } = get();
        const weekDays = getWeekDays();
        return checkIns.filter((c) => weekDays.includes(c.date)).length;
      },
      getTotalCheckIns: () => get().checkIns.length,
      getLastCheckIn: () => {
        const { checkIns } = get();
        if (checkIns.length === 0) return 'Never';
        const lastDate = checkIns[0].date;
        const today = getToday();
        if (lastDate === today) return 'Today';
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toISOString().split('T')[0]) return 'Yesterday';
        return lastDate;
      },
    }),
    {
      name: 'aa-tracker-storage',
    }
  )
);
