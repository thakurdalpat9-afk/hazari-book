import type { Language } from '@/constants/i18n';
import type { ThemeMode } from '@/constants/theme';

export type AttendanceStatus = 'present' | 'absent' | 'half';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  dailyWage: number;
  workType: string;
  address: string;
  photo: string | null;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  overtimeHours: number;
  notes: string;
}

export interface AdvanceRecord {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  note: string;
}

export interface SalaryRecord {
  id: string;
  workerId: string;
  month: number; // 0-11
  year: number;
  totalEarned: number;
  advancePaid: number;
  isPaid: boolean;
  paidDate: string | null;
}

export interface AppSettings {
  language: Language;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  autoBackup: boolean;
  lastBackup: string | null;
  user: { name: string; phone: string; isGuest: boolean } | null;
}

export interface BackupData {
  workers: Worker[];
  attendance: AttendanceRecord[];
  advances: AdvanceRecord[];
  salaries: SalaryRecord[];
  settings: AppSettings;
  exportedAt: string;
  version: number;
}
