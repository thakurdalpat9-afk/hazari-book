import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { useApp } from '@/store/AppContext';
import { Card, EmptyState } from '@/components/ui';
import { BarChart3, FileText, FileSpreadsheet, Printer, Calendar, ChevronLeft, ChevronRight, TrendingUp, Users, Clock } from 'lucide-react-native';

type ReportType = 'daily' | 'weekly' | 'monthly';

interface ReportRow {
  worker: { name: string } | undefined;
  status?: string;
  present?: number;
  half?: number;
  absent?: number;
  overtime: number;
  earned: number;
}

export default function ReportsScreen() {
  const { workers, attendance, advances, calculateSalary, t, theme } = useApp();
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [weekOffset, setWeekOffset] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const reportData = useMemo(() => {
    if (reportType === 'daily') {
      const recs = attendance.filter((a) => a.date === selectedDate);
      return recs.map((r) => {
        const w = workers.find((x) => x.id === r.workerId);
        return {
          worker: w,
          status: r.status,
          overtime: r.overtimeHours,
          earned: r.status === 'present' ? (w?.dailyWage || 0) + (r.overtimeHours || 0) * ((w?.dailyWage || 0) / 8) : r.status === 'half' ? (w?.dailyWage || 0) / 2 : 0,
        } as ReportRow;
      });
    } else if (reportType === 'weekly') {
      const ref = new Date();
      ref.setDate(ref.getDate() + weekOffset * 7);
      const day = ref.getDay();
      const weekStart = new Date(ref);
      weekStart.setDate(ref.getDate() - day);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const startStr = weekStart.toISOString().slice(0, 10);
      const endStr = weekEnd.toISOString().slice(0, 10);
      const recs = attendance.filter((a) => a.date >= startStr && a.date <= endStr);
      return workers.map((w) => {
        const wRecs = recs.filter((r) => r.workerId === w.id);
        const present = wRecs.filter((r) => r.status === 'present').length;
        const half = wRecs.filter((r) => r.status === 'half').length;
        const ot = wRecs.reduce((s, r) => s + (r.overtimeHours || 0), 0);
        const earned = present * w.dailyWage + half * (w.dailyWage / 2) + ot * (w.dailyWage / 8);
        return { worker: w, present, half, absent: wRecs.filter((r) => r.status === 'absent').length, overtime: ot, earned } as ReportRow;
      }).filter((x) => (x.present || 0) + (x.half || 0) > 0 || (x.absent || 0) > 0);
    } else {
      return workers.map((w) => {
        const calc = calculateSalary(w.id, month, year);
        return { worker: w, present: calc.presentDays, half: calc.halfDays, absent: calc.absentDays, overtime: calc.overtimeHours, earned: calc.totalEarned } as ReportRow;
      }).filter((x) => (x.present || 0) + (x.half || 0) + (x.absent || 0) > 0);
    }
  }, [reportType, selectedDate, weekOffset, month, year, workers, attendance, calculateSalary]);

  const totalEarned = reportData.reduce((s, x) => s + (x.earned || 0), 0);
  const totalPresent = reportData.reduce((s, x) => s + (x.present || (x.status === 'present' ? 1 : 0)), 0);
  const totalOT = reportData.reduce((s, x) => s + (x.overtime || 0), 0);

  const handleExport = (format: 'pdf' | 'excel' | 'print') => {
    const lines = reportData.map((d) => `${d.worker?.name}\t${d.status || ''}\t₹${(d.earned || 0).toFixed(0)}`);
    const text = `Hazari Book Report\n${reportType.toUpperCase()}\n\n${lines.join('\n')}\n\nTotal: ₹${totalEarned.toFixed(0)}`;
    if (format === 'print' && Platform.OS === 'web') {
      window.print();
      return;
    }
    Share.share({ message: text, title: `Hazari Book ${reportType} Report` }).catch(() => {});
  };

  const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('reports')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Report Type Tabs */}
        <View style={[styles.typeTabs, { backgroundColor: theme.colors.inputBg }]}>
          {(['daily', 'weekly', 'monthly'] as ReportType[]).map((rt) => (
            <TouchableOpacity
              key={rt}
              style={[styles.typeTab, reportType === rt && styles.typeTabActive]}
              onPress={() => setReportType(rt)}>
              <Text style={[styles.typeTabText, { color: reportType === rt ? '#fff' : theme.colors.textSecondary }]}>
                {rt === 'daily' ? t('dailyReport') : rt === 'weekly' ? t('weeklyReport') : t('monthlyReport')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Controls */}
        <View style={[styles.dateControl, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {reportType === 'daily' && (
            <View style={styles.dateNavRow}>
              <TouchableOpacity onPress={() => {
                const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}>
                <ChevronLeft color={theme.colors.text} size={22} />
              </TouchableOpacity>
              <View style={styles.dateCenter}>
                <Calendar color={theme.colors.primary} size={18} />
                <Text style={[styles.dateText, { color: theme.colors.text }]}>
                  {selectedDate === new Date().toISOString().slice(0, 10) ? t('today') : selectedDate}
                </Text>
              </View>
              <TouchableOpacity onPress={() => {
                const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}>
                <ChevronRight color={theme.colors.text} size={22} />
              </TouchableOpacity>
            </View>
          )}
          {reportType === 'weekly' && (
            <View style={styles.dateNavRow}>
              <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
                <ChevronLeft color={theme.colors.text} size={22} />
              </TouchableOpacity>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {weekOffset === 0 ? t('thisWeek') : weekOffset === -1 ? t('yesterday') : `${t('custom')} (${weekOffset})`}
              </Text>
              <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
                <ChevronRight color={theme.colors.text} size={22} />
              </TouchableOpacity>
            </View>
          )}
          {reportType === 'monthly' && (
            <View style={styles.dateNavRow}>
              <TouchableOpacity onPress={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }}>
                <ChevronLeft color={theme.colors.text} size={22} />
              </TouchableOpacity>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {t(monthNames[month])} {year}
              </Text>
              <TouchableOpacity onPress={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }}>
                <ChevronRight color={theme.colors.text} size={22} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TrendingUp color="#0B7A4B" size={20} />
            <Text style={[styles.summaryCardLabel, { color: theme.colors.textSecondary }]}>{t('totalEarned')}</Text>
            <Text style={[styles.summaryCardValue, { color: theme.colors.text }]}>₹{totalEarned.toFixed(0)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Users color="#2563EB" size={20} />
            <Text style={[styles.summaryCardLabel, { color: theme.colors.textSecondary }]}>{t('present')}</Text>
            <Text style={[styles.summaryCardValue, { color: theme.colors.text }]}>{totalPresent}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Clock color="#F59E0B" size={20} />
            <Text style={[styles.summaryCardLabel, { color: theme.colors.textSecondary }]}>{t('overtime')}</Text>
            <Text style={[styles.summaryCardValue, { color: theme.colors.text }]}>{totalOT}{t('hours')}</Text>
          </View>
        </View>

        {/* Export Buttons */}
        <View style={styles.exportRow}>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => handleExport('pdf')}>
            <FileText color="#DC2626" size={20} />
            <Text style={[styles.exportText, { color: theme.colors.text }]}>{t('exportPdf')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => handleExport('excel')}>
            <FileSpreadsheet color="#16A34A" size={20} />
            <Text style={[styles.exportText, { color: theme.colors.text }]}>{t('exportExcel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => handleExport('print')}>
            <Printer color="#2563EB" size={20} />
            <Text style={[styles.exportText, { color: theme.colors.text }]}>{t('print')}</Text>
          </TouchableOpacity>
        </View>

        {/* Report Table */}
        {reportData.length === 0 ? (
          <EmptyState
            icon={<BarChart3 color="#0B7A4B" size={32} />}
            title={t('noDataForReport')}
          />
        ) : (
          <Card style={styles.tableCard}>
            <View style={[styles.tableHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.tableHeaderText, { color: theme.colors.textSecondary, flex: 2 }]}>{t('worker')}</Text>
              <Text style={[styles.tableHeaderText, { color: theme.colors.textSecondary, flex: 1 }]}>{t('status')}</Text>
              <Text style={[styles.tableHeaderText, { color: theme.colors.textSecondary, flex: 1, textAlign: 'right' }]}>{t('amount')}</Text>
            </View>
            {reportData.map((d, i) => (
              <View key={i} style={[styles.tableRow, i < reportData.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}>
                <Text style={[styles.tableCellName, { color: theme.colors.text, flex: 2 }]} numberOfLines={1}>{d.worker?.name}</Text>
                <Text style={[styles.tableCell, { color: theme.colors.textSecondary, flex: 1 }]}>
                  {d.status ? t(d.status) : `${d.present || 0}P ${d.half || 0}H`}
                </Text>
                <Text style={[styles.tableCellAmount, { color: theme.colors.primary, flex: 1 }]}>₹{(d.earned || 0).toFixed(0)}</Text>
              </View>
            ))}
            <View style={[styles.tableFooter, { borderTopColor: theme.colors.border }]}>
              <Text style={styles.tableFooterLabel}>{t('grandTotal')}</Text>
              <Text style={styles.tableFooterValue}>₹{totalEarned.toFixed(0)}</Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  typeTabs: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 14 },
  typeTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  typeTabActive: { backgroundColor: '#0B7A4B' },
  typeTabText: { fontSize: 13, fontWeight: '600' },
  dateControl: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  dateNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 16, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, alignItems: 'center' },
  summaryCardLabel: { fontSize: 12, fontWeight: '500', marginTop: 8, textAlign: 'center' },
  summaryCardValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  exportRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  exportText: { fontSize: 13, fontWeight: '600' },
  tableCard: { padding: 0, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', padding: 14, borderBottomWidth: 1 },
  tableHeaderText: { fontSize: 13, fontWeight: '700' },
  tableRow: { flexDirection: 'row', padding: 14, alignItems: 'center' },
  tableCellName: { fontSize: 15, fontWeight: '600' },
  tableCell: { fontSize: 14 },
  tableCellAmount: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  tableFooter: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderTopWidth: 2 },
  tableFooterLabel: { fontSize: 16, fontWeight: '800', color: '#0B7A4B' },
  tableFooterValue: { fontSize: 18, fontWeight: '900', color: '#0B7A4B' },
});
