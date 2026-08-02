import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Language } from '@/constants/i18n';
import { translate } from '@/constants/i18n';
import type { ThemeMode } from '@/constants/theme';
import { lightTheme, darkTheme, type AppTheme } from '@/constants/theme';
import type {
  Worker,
  AttendanceRecord,
  AdvanceRecord,
  SalaryRecord,
  AppSettings,
  BackupData,
  AttendanceStatus,
} from '@/types';

const STORAGE_KEY = '@hazaribook:data';
const SETTINGS_KEY = '@hazaribook:settings';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'gu',
  themeMode: 'light',
  notificationsEnabled: true,
  autoBackup: false,
  lastBackup: null,
  user: null,
};

interface AppContextValue {
  workers: Worker[];
  attendance: AttendanceRecord[];
  advances: AdvanceRecord[];
  salaries: SalaryRecord[];
  settings: AppSettings;
  theme: AppTheme;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setNotificationsEnabled: (v: boolean) => void;
  setAutoBackup: (v: boolean) => void;
  setUser: (u: AppSettings['user']) => void;
  addWorker: (w: Omit<Worker, 'id' | 'createdAt'>) => void;
  updateWorker: (id: string, w: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  markAttendance: (workerId: string, date: string, status: AttendanceStatus, overtimeHours: number, notes: string) => void;
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getAttendanceForWorker: (workerId: string, month: number, year: number) => AttendanceRecord[];
  addAdvance: (workerId: string, date: string, amount: number, note: string) => void;
  getAdvancesForWorker: (workerId: string, month: number, year: number) => AdvanceRecord[];
  calculateSalary: (workerId: string, month: number, year: number) => SalaryCalc;
  markSalaryPaid: (workerId: string, month: number, year: number) => void;
  isSalaryPaid: (workerId: string, month: number, year: number) => boolean;
  createBackup: () => Promise<boolean>;
  restoreBackup: () => Promise<boolean>;
  deleteAllData: () => Promise<void>;
  loadDemoData: () => void;
}

export interface SalaryCalc {
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalDays: number;
  baseEarnings: number;
  overtimeHours: number;
  otEarnings: number;
  totalEarned: number;
  advancePaid: number;
  remaining: number;
}

const AppContext = createContext<AppContextValue | null>(null);

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [advances, setAdvances] = useState<AdvanceRecord[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load
  useEffect(() => {
    (async () => {
      try {
        const sRaw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (sRaw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(sRaw) });
        const dRaw = await AsyncStorage.getItem(STORAGE_KEY);
        if (dRaw) {
          const d = JSON.parse(dRaw);
          setWorkers(d.workers || []);
          setAttendance(d.attendance || []);
          setAdvances(d.advances || []);
          setSalaries(d.salaries || []);
        }
      } catch {
        // ignore
      }
      setLoaded(true);
    })();
  }, []);

  // Persist data
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ workers, attendance, advances, salaries })).catch(() => {});
  }, [workers, attendance, advances, salaries, loaded]);

  // Persist settings
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  const theme = settings.themeMode === 'dark' ? darkTheme : lightTheme;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(settings.language, key, params),
    [settings.language],
  );

  const setLanguage = useCallback((language: Language) => setSettings((s) => ({ ...s, language })), []);
  const setThemeMode = useCallback((themeMode: ThemeMode) => setSettings((s) => ({ ...s, themeMode })), []);
  const toggleTheme = useCallback(() => setSettings((s) => ({ ...s, themeMode: s.themeMode === 'dark' ? 'light' : 'dark' })), []);
  const setNotificationsEnabled = useCallback((notificationsEnabled: boolean) => setSettings((s) => ({ ...s, notificationsEnabled })), []);
  const setAutoBackup = useCallback((autoBackup: boolean) => setSettings((s) => ({ ...s, autoBackup })), []);
  const setUser = useCallback((user: AppSettings['user']) => setSettings((s) => ({ ...s, user })), []);

  const addWorker = useCallback((w: Omit<Worker, 'id' | 'createdAt'>) => {
    setWorkers((prev) => [{ ...w, id: uid(), createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const updateWorker = useCallback((id: string, w: Partial<Worker>) => {
    setWorkers((prev) => prev.map((x) => (x.id === id ? { ...x, ...w } : x)));
  }, []);

  const deleteWorker = useCallback((id: string) => {
    setWorkers((prev) => prev.filter((x) => x.id !== id));
    setAttendance((prev) => prev.filter((x) => x.workerId !== id));
    setAdvances((prev) => prev.filter((x) => x.workerId !== id));
    setSalaries((prev) => prev.filter((x) => x.workerId !== id));
  }, []);

  const markAttendance = useCallback(
    (workerId: string, date: string, status: AttendanceStatus, overtimeHours: number, notes: string) => {
      setAttendance((prev) => {
        const existing = prev.find((a) => a.workerId === workerId && a.date === date);
        if (existing) {
          return prev.map((a) => (a.id === existing.id ? { ...a, status, overtimeHours, notes } : a));
        }
        return [...prev, { id: uid(), workerId, date, status, overtimeHours, notes }];
      });
    },
    [],
  );

  const getAttendanceForDate = useCallback(
    (date: string) => attendance.filter((a) => a.date === date),
    [attendance],
  );

  const getAttendanceForWorker = useCallback(
    (workerId: string, month: number, year: number) => {
      return attendance.filter((a) => {
        if (a.workerId !== workerId) return false;
        const d = new Date(a.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
    },
    [attendance],
  );

  const addAdvance = useCallback((workerId: string, date: string, amount: number, note: string) => {
    setAdvances((prev) => [...prev, { id: uid(), workerId, date, amount, note }]);
  }, []);

  const getAdvancesForWorker = useCallback(
    (workerId: string, month: number, year: number) => {
      return advances.filter((a) => {
        if (a.workerId !== workerId) return false;
        const d = new Date(a.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
    },
    [advances],
  );

  const calculateSalary = useCallback(
    (workerId: string, month: number, year: number): SalaryCalc => {
      const worker = workers.find((w) => w.id === workerId);
      const wage = worker?.dailyWage || 0;
      const recs = getAttendanceForWorker(workerId, month, year);
      const presentDays = recs.filter((r) => r.status === 'present').length;
      const halfDays = recs.filter((r) => r.status === 'half').length;
      const absentDays = recs.filter((r) => r.status === 'absent').length;
      const totalDays = presentDays + halfDays + absentDays;
      const baseEarnings = presentDays * wage + halfDays * (wage / 2);
      const overtimeHours = recs.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
      const otRate = wage / 8;
      const otEarnings = overtimeHours * otRate;
      const totalEarned = baseEarnings + otEarnings;
      const advancePaid = getAdvancesForWorker(workerId, month, year).reduce((s, a) => s + a.amount, 0);
      return {
        presentDays,
        halfDays,
        absentDays,
        totalDays,
        baseEarnings,
        overtimeHours,
        otEarnings,
        totalEarned,
        advancePaid,
        remaining: totalEarned - advancePaid,
      };
    },
    [workers, getAttendanceForWorker, getAdvancesForWorker],
  );

  const markSalaryPaid = useCallback((workerId: string, month: number, year: number) => {
    setSalaries((prev) => {
      const existing = prev.find((s) => s.workerId === workerId && s.month === month && s.year === year);
      if (existing) {
        return prev.map((s) => (s.id === existing.id ? { ...s, isPaid: !s.isPaid, paidDate: !s.isPaid ? todayStr() : null } : s));
      }
      return [...prev, { id: uid(), workerId, month, year, totalEarned: 0, advancePaid: 0, isPaid: true, paidDate: todayStr() }];
    });
  }, []);

  const isSalaryPaid = useCallback(
    (workerId: string, month: number, year: number) => {
      return salaries.some((s) => s.workerId === workerId && s.month === month && s.year === year && s.isPaid);
    },
    [salaries],
  );

  const createBackup = useCallback(async () => {
    try {
      const data: BackupData = {
        workers,
        attendance,
        advances,
        salaries,
        settings,
        exportedAt: new Date().toISOString(),
        version: 1,
      };
      await AsyncStorage.setItem('@hazaribook:backup', JSON.stringify(data));
      setSettings((s) => ({ ...s, lastBackup: new Date().toISOString() }));
      return true;
    } catch {
      return false;
    }
  }, [workers, attendance, advances, salaries, settings]);

  const restoreBackup = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('@hazaribook:backup');
      if (!raw) return false;
      const d: BackupData = JSON.parse(raw);
      setWorkers(d.workers || []);
      setAttendance(d.attendance || []);
      setAdvances(d.advances || []);
      setSalaries(d.salaries || []);
      if (d.settings) setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteAllData = useCallback(async () => {
    setWorkers([]);
    setAttendance([]);
    setAdvances([]);
    setSalaries([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem('@hazaribook:backup');
  }, []);

  const loadDemoData = useCallback(() => {
    const names = ['રમેશ', 'સુરેશ', 'કમલેશ', 'દિપક', 'અમિત'];
    const types = ['mason', 'labor', 'carpenter', 'helper', 'painter'];
    const newWorkers: Worker[] = names.map((n, i) => ({
      id: uid(),
      name: n,
      phone: `98${i}9${i}9${i}9${i}9`,
      dailyWage: 400 + i * 50,
      workType: types[i],
      address: 'અમદાવાદ',
      photo: null,
      createdAt: new Date().toISOString(),
    }));
    setWorkers(newWorkers);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      workers,
      attendance,
      advances,
      salaries,
      settings,
      theme,
      t,
      setLanguage,
      setThemeMode,
      toggleTheme,
      setNotificationsEnabled,
      setAutoBackup,
      setUser,
      addWorker,
      updateWorker,
      deleteWorker,
      markAttendance,
      getAttendanceForDate,
      getAttendanceForWorker,
      addAdvance,
      getAdvancesForWorker,
      calculateSalary,
      markSalaryPaid,
      isSalaryPaid,
      createBackup,
      restoreBackup,
      deleteAllData,
      loadDemoData,
    }),
    [workers, attendance, advances, salaries, settings, theme, t, setLanguage, setThemeMode, toggleTheme, setNotificationsEnabled, setAutoBackup, setUser, addWorker, updateWorker, deleteWorker, markAttendance, getAttendanceForDate, getAttendanceForWorker, addAdvance, getAdvancesForWorker, calculateSalary, markSalaryPaid, isSalaryPaid, createBackup, restoreBackup, deleteAllData, loadDemoData],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useT() {
  return useApp().t;
}
