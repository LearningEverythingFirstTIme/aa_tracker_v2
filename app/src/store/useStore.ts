import { create } from 'zustand';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { db, auth } from '../firebase/config';

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
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Data
  meetings: Meeting[];
  history: HistoryItem[];
  transactions: TreasuryTransaction[];
  checkIns: CheckIn[];

  // Streak
  currentStreak: number;
  longestStreak: number;

  // Actions - Meetings
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;

  // Actions - History
  addHistoryItem: (item: Omit<HistoryItem, 'id'>) => Promise<void>;
  updateHistoryItem: (id: string, item: Partial<HistoryItem>) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;

  // Actions - Treasury
  addTransaction: (transaction: Omit<TreasuryTransaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getBalance: () => number;
  getAverageContribution: () => number;

  // Actions - Check-ins
  checkIn: (meetingId: string, meetingName: string) => Promise<void>;
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

export const useStore = create<StoreState>((set, get) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  loading: true,

  login: async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  signup: async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ isAuthenticated: false, user: null });
  },

  // Data
  meetings: [],
  history: [],
  transactions: [],
  checkIns: [],

  currentStreak: 0,
  longestStreak: 0,

  // Meeting actions
  addMeeting: async (meeting) => {
    const user = get().user;
    if (!user) return;

    const newMeeting = { ...meeting, id: generateId() };
    await setDoc(doc(db, 'users', user.uid, 'meetings', newMeeting.id), newMeeting);
    set((state) => ({ meetings: [...state.meetings, newMeeting] }));
  },

  updateMeeting: async (id, updates) => {
    const user = get().user;
    if (!user) return;

    await setDoc(doc(db, 'users', user.uid, 'meetings', id), updates, { merge: true });
    set((state) => ({
      meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  deleteMeeting: async (id) => {
    const user = get().user;
    if (!user) return;

    await deleteDoc(doc(db, 'users', user.uid, 'meetings', id));
    set((state) => ({
      meetings: state.meetings.filter((m) => m.id !== id),
    }));
  },

  // History actions
  addHistoryItem: async (item) => {
    const user = get().user;
    if (!user) return;

    const newItem = { ...item, id: generateId() };
    await setDoc(doc(db, 'users', user.uid, 'history', newItem.id), newItem);
    set((state) => ({ history: [newItem, ...state.history] }));
  },

  updateHistoryItem: async (id, updates) => {
    const user = get().user;
    if (!user) return;

    await setDoc(doc(db, 'users', user.uid, 'history', id), updates, { merge: true });
    set((state) => ({
      history: state.history.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  deleteHistoryItem: async (id) => {
    const user = get().user;
    if (!user) return;

    await deleteDoc(doc(db, 'users', user.uid, 'history', id));
    set((state) => ({
      history: state.history.filter((h) => h.id !== id),
    }));
  },

  // Treasury actions
  addTransaction: async (transaction) => {
    const user = get().user;
    if (!user) return;

    const newTransaction = { ...transaction, id: generateId() };
    await setDoc(doc(db, 'users', user.uid, 'transactions', newTransaction.id), newTransaction);
    set((state) => ({ transactions: [newTransaction, ...state.transactions] }));
  },

  deleteTransaction: async (id) => {
    const user = get().user;
    if (!user) return;

    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
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
  checkIn: async (meetingId, meetingName) => {
    const user = get().user;
    if (!user) return;

    const today = getToday();
    const newCheckIn = {
      id: generateId(),
      date: today,
      meetingId,
      meetingName,
    };

    await setDoc(doc(db, 'users', user.uid, 'checkIns', newCheckIn.id), newCheckIn);

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
}));

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    useStore.setState({ isAuthenticated: true, user, loading: false });

    // Load user data from Firestore
    const loadUserData = async () => {
      const meetingsSnap = await getDocs(collection(db, 'users', user.uid, 'meetings'));
      const historySnap = await getDocs(collection(db, 'users', user.uid, 'history'));
      const transactionsSnap = await getDocs(collection(db, 'users', user.uid, 'transactions'));
      const checkInsSnap = await getDocs(collection(db, 'users', user.uid, 'checkIns'));

      const meetings = meetingsSnap.docs.map(d => d.data() as Meeting);
      const history = historySnap.docs.map(d => d.data() as HistoryItem);
      const transactions = transactionsSnap.docs.map(d => d.data() as TreasuryTransaction);
      const checkIns = checkInsSnap.docs.map(d => d.data() as CheckIn);

      const { current, longest } = calculateStreak(checkIns);

      useStore.setState({
        meetings,
        history,
        transactions,
        checkIns,
        currentStreak: current,
        longestStreak: longest,
      });
    };

    loadUserData();
  } else {
    useStore.setState({
      isAuthenticated: false,
      user: null,
      loading: false,
      meetings: [],
      history: [],
      transactions: [],
      checkIns: [],
      currentStreak: 0,
      longestStreak: 0,
    });
  }
});
