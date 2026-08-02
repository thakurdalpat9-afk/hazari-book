import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/store/AppContext';
import { Card, EmptyState } from '@/components/ui';
import { Calendar, List, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, StickyNote } from 'lucide-react-native';
import type { AttendanceStatus, AttendanceRecord } from '@/types';

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES_KEY = ['january','february','march','april','may','june','july','august','september','october','november','december'];

export default function AttendanceScreen() {
  const { workers, attendance, markAttendance, getAttendanceForDate, t, theme } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [editWorker, setEditWorker] = useState<string | null>(null);

  const todayAtt = getAttendanceForDate(selectedDate);

  const getStatusForWorker = (workerId: string): AttendanceRecord | undefined => {
    return todayAtt.find((a) => a.workerId === workerId);
  };

  const setStatus = (workerId: string, status: AttendanceStatus) => {
    const existing = getStatusForWorker(workerId);
    markAttendance(workerId, selectedDate, status, existing?.overtimeHours || 0, existing?.notes || '');
  };

  // Calendar grid
  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calMonth, calYear]);

  const getCalDayStatus = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const recs = attendance.filter((a) => a.date === dateStr);
    if (recs.length === 0) return null;
    const present = recs.filter((r) => r.status === 'present').length;
    const absent = recs.filter((r) => r.status === 'absent').length;
    const half = recs.filter((r) => r.status === 'half').length;
    if (present > 0 && absent === 0 && half === 0) return 'present';
    if (absent > 0 && present === 0 && half === 0) return 'absent';
    return 'mixed';
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const presentCount = todayAtt.filter((a) => a.status === 'present').length;
  const absentCount = todayAtt.filter((a) => a.status === 'absent').length;
  const halfCount = todayAtt.filter((a) => a.status === 'half').length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('attendance')}</Text>
        <View style={[styles.viewToggle, { backgroundColor: theme.colors.inputBg }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}>
            <List color={viewMode === 'list' ? '#fff' : theme.colors.textSecondary} size={18} />
            <Text style={[styles.toggleText, { color: viewMode === 'list' ? '#fff' : theme.colors.textSecondary }]}>{t('list')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleBtnActive]}
            onPress={() => setViewMode('calendar')}>
            <Calendar color={viewMode === 'calendar' ? '#fff' : theme.colors.textSecondary} size={18} />
            <Text style={[styles.toggleText, { color: viewMode === 'calendar' ? '#fff' : theme.colors.textSecondary }]}>{t('calendar')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'calendar' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Calendar */}
          <Card style={styles.calCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.calNav}>
                <ChevronLeft color={theme.colors.text} size={22} />
              </TouchableOpacity>
              <Text style={[styles.calMonth, { color: theme.colors.text }]}>
                {t(MONTH_NAMES_KEY[calMonth])} {calYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calNav}>
                <ChevronRight color={theme.colors.text} size={22} />
              </TouchableOpacity>
            </View>
            <View style={styles.calWeekRow}>
              {WEEK_DAYS.map((d, i) => (
                <Text key={i} style={[styles.calWeekDay, { color: theme.colors.textMuted }]}>{d}</Text>
              ))}
            </View>
            <View style={styles.calGrid}>
              {calDays.map((day, i) => {
                if (day === null) return <View key={i} style={styles.calCell} />;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dateStr === selectedDate;
                const status = getCalDayStatus(day);
                const isToday = dateStr === new Date().toISOString().slice(0, 10);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.calCell,
                      isSelected && styles.calCellSelected,
                      { backgroundColor: isSelected ? '#0B7A4B' : 'transparent' },
                    ]}
                    onPress={() => { setSelectedDate(dateStr); setViewMode('list'); }}>
                    <Text style={[
                      styles.calDay,
                      { color: isSelected ? '#fff' : theme.colors.text },
                      isToday && !isSelected && { color: '#0B7A4B', fontWeight: '800' },
                    ]}>
                      {day}
                    </Text>
                    {status && (
                      <View style={[
                        styles.calDot,
                        { backgroundColor: isSelected ? '#fff' : status === 'present' ? '#16A34A' : status === 'absent' ? '#DC2626' : '#F59E0B' },
                      ]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{t('present')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{t('absent')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{t('half')}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Date Selector + Summary */}
          <View style={styles.dateBar}>
            <TouchableOpacity onPress={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().slice(0, 10));
            }}>
              <ChevronLeft color={theme.colors.textSecondary} size={24} />
            </TouchableOpacity>
            <View style={styles.dateCenter}>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {selectedDate === new Date().toISOString().slice(0, 10) ? t('today') : selectedDate}
              </Text>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryPill, { backgroundColor: theme.colors.successSoft }]}>
                  <Text style={[styles.summaryPillText, { color: theme.colors.success }]}>{presentCount} {t('present')}</Text>
                </View>
                <View style={[styles.summaryPill, { backgroundColor: theme.colors.errorSoft }]}>
                  <Text style={[styles.summaryPillText, { color: theme.colors.error }]}>{absentCount} {t('absent')}</Text>
                </View>
                <View style={[styles.summaryPill, { backgroundColor: theme.colors.warningSoft }]}>
                  <Text style={[styles.summaryPillText, { color: theme.colors.warning }]}>{halfCount} {t('half')}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().slice(0, 10));
            }}>
              <ChevronRight color={theme.colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          {/* Worker List */}
          {workers.length === 0 ? (
            <EmptyState
              icon={<Calendar color="#0B7A4B" size={32} />}
              title={t('noWorkersYet')}
              subtitle={t('noWorkersSub')}
            />
          ) : (
            <FlatList
              data={workers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const att = getStatusForWorker(item.id);
                return (
                  <Card style={styles.attCard}>
                    <View style={styles.attTop}>
                      <View style={[styles.attAvatar, { backgroundColor: theme.colors.primarySoft }]}>
                        <Text style={[styles.attAvatarText, { color: theme.colors.primary }]}>{item.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.attInfo}>
                        <Text style={[styles.attName, { color: theme.colors.text }]}>{item.name}</Text>
                        <Text style={[styles.attType, { color: theme.colors.textSecondary }]}>{t(item.workType)} · ₹{item.dailyWage}{t('perDay')}</Text>
                      </View>
                    </View>
                    <View style={styles.statusRow}>
                      {(['present', 'half', 'absent'] as AttendanceStatus[]).map((s) => {
                        const isActive = att?.status === s;
                        const colors = {
                          present: { bg: '#16A34A', soft: theme.colors.successSoft, icon: <CheckCircle2 color={isActive ? '#fff' : '#16A34A'} size={18} /> },
                          half: { bg: '#F59E0B', soft: theme.colors.warningSoft, icon: <Clock color={isActive ? '#fff' : '#F59E0B'} size={18} /> },
                          absent: { bg: '#DC2626', soft: theme.colors.errorSoft, icon: <XCircle color={isActive ? '#fff' : '#DC2626'} size={18} /> },
                        };
                        return (
                          <TouchableOpacity
                            key={s}
                            style={[
                              styles.statusBtn,
                              { backgroundColor: isActive ? colors[s].bg : colors[s].soft },
                            ]}
                            onPress={() => setStatus(item.id, s)}>
                            {colors[s].icon}
                            <Text style={[styles.statusBtnText, { color: isActive ? '#fff' : theme.colors.text }]}>{t(s)}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {att && (att.overtimeHours > 0 || att.notes) ? (
                      <View style={[styles.attExtra, { borderTopColor: theme.colors.borderSoft }]}>
                        {att.overtimeHours > 0 && (
                          <View style={styles.extraRow}>
                            <Clock color={theme.colors.textMuted} size={14} />
                            <Text style={[styles.extraText, { color: theme.colors.textSecondary }]}>{att.overtimeHours} {t('hours')} OT</Text>
                          </View>
                        )}
                        {att.notes ? (
                          <View style={styles.extraRow}>
                            <StickyNote color={theme.colors.textMuted} size={14} />
                            <Text style={[styles.extraText, { color: theme.colors.textSecondary }]}>{att.notes}</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </Card>
                );
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  viewToggle: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9 },
  toggleBtnActive: { backgroundColor: '#0B7A4B' },
  toggleText: { fontSize: 13, fontWeight: '600' },
  dateBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  dateCenter: { alignItems: 'center', gap: 6 },
  dateText: { fontSize: 16, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  summaryPillText: { fontSize: 12, fontWeight: '600' },
  attCard: { marginBottom: 12, padding: 16 },
  attTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  attAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  attAvatarText: { fontSize: 18, fontWeight: '700' },
  attInfo: { flex: 1 },
  attName: { fontSize: 16, fontWeight: '700' },
  attType: { fontSize: 13, marginTop: 2 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  statusBtnText: { fontSize: 13, fontWeight: '600' },
  attExtra: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 6 },
  extraRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  extraText: { fontSize: 13 },
  calCard: { padding: 16 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calNav: { padding: 4 },
  calMonth: { fontSize: 17, fontWeight: '700' },
  calWeekRow: { flexDirection: 'row', marginBottom: 8 },
  calWeekDay: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '600' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, position: 'relative' },
  calCellSelected: {},
  calDay: { fontSize: 15, fontWeight: '600' },
  calDot: { position: 'absolute', bottom: 6, width: 6, height: 6, borderRadius: 3 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, fontWeight: '500' },
});
