import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/store/AppContext';
import { Card, EmptyState } from '@/components/ui';
import { Wallet, ChevronLeft, ChevronRight, Plus, CheckCircle2, Clock, TrendingUp, Banknote } from 'lucide-react-native';
import type { SalaryCalc } from '@/store/AppContext';

const MONTH_KEYS = ['january','february','march','april','may','june','july','august','september','october','november','december'];

export default function SalaryScreen() {
  const { workers, calculateSalary, isSalaryPaid, markSalaryPaid, addAdvance, getAdvancesForWorker, t, theme } = useApp();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [advanceModal, setAdvanceModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceNote, setAdvanceNote] = useState('');

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const allCalc = useMemo(() => {
    return workers.map((w) => ({
      worker: w,
      calc: calculateSalary(w.id, month, year),
      paid: isSalaryPaid(w.id, month, year),
    }));
  }, [workers, month, year, calculateSalary, isSalaryPaid]);

  const totalEarned = allCalc.reduce((s, x) => s + x.calc.totalEarned, 0);
  const totalAdvance = allCalc.reduce((s, x) => s + x.calc.advancePaid, 0);
  const totalRemaining = allCalc.reduce((s, x) => s + x.calc.remaining, 0);

  const handleAddAdvance = () => {
    if (!selectedWorker || !advanceAmount) return;
    addAdvance(selectedWorker, new Date().toISOString().slice(0, 10), Number(advanceAmount), advanceNote);
    setAdvanceModal(false);
    setAdvanceAmount('');
    setAdvanceNote('');
  };

  const workerAdvances = selectedWorker ? getAdvancesForWorker(selectedWorker, month, year) : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('salary')}</Text>
      </View>

      {/* Month Selector */}
      <View style={[styles.monthBar, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthNav}>
          <ChevronLeft color={theme.colors.text} size={22} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: theme.colors.text }]}>
          {t(MONTH_KEYS[month])} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthNav}>
          <ChevronRight color={theme.colors.text} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <LinearGradient colors={['#0B7A4B', '#095C39']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summaryCard}>
            <TrendingUp color="#fff" size={22} />
            <Text style={styles.summaryLabel}>{t('totalEarned')}</Text>
            <Text style={styles.summaryValue}>₹{totalEarned.toFixed(0)}</Text>
          </LinearGradient>
          <View style={styles.summaryCol}>
            <View style={[styles.summaryCardSmall, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Banknote color="#F59E0B" size={18} />
              <Text style={[styles.summarySmallLabel, { color: theme.colors.textSecondary }]}>{t('advancePaid')}</Text>
              <Text style={[styles.summarySmallValue, { color: theme.colors.text }]}>₹{totalAdvance.toFixed(0)}</Text>
            </View>
            <View style={[styles.summaryCardSmall, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Wallet color="#DC2626" size={18} />
              <Text style={[styles.summarySmallLabel, { color: theme.colors.textSecondary }]}>{t('remainingBalance')}</Text>
              <Text style={[styles.summarySmallValue, { color: theme.colors.text }]}>₹{totalRemaining.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Worker Salary List */}
        {workers.length === 0 ? (
          <EmptyState
            icon={<Wallet color="#0B7A4B" size={32} />}
            title={t('noWorkersYet')}
            subtitle={t('noWorkersSub')}
          />
        ) : (
          allCalc.map(({ worker, calc, paid }) => (
            <Card key={worker.id} style={styles.salaryCard}>
              <View style={styles.salaryTop}>
                <View style={[styles.salaryAvatar, { backgroundColor: theme.colors.primarySoft }]}>
                  <Text style={[styles.salaryAvatarText, { color: theme.colors.primary }]}>{worker.name.charAt(0)}</Text>
                </View>
                <View style={styles.salaryInfo}>
                  <Text style={[styles.salaryName, { color: theme.colors.text }]}>{worker.name}</Text>
                  <Text style={[styles.salaryType, { color: theme.colors.textSecondary }]}>{t(worker.workType)} · ₹{worker.dailyWage}{t('perDay')}</Text>
                </View>
                {paid && (
                  <View style={[styles.paidBadge, { backgroundColor: theme.colors.successSoft }]}>
                    <CheckCircle2 color={theme.colors.success} size={14} />
                    <Text style={[styles.paidText, { color: theme.colors.success }]}>{t('paid')}</Text>
                  </View>
                )}
              </View>

              <View style={styles.salaryStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: theme.colors.success }]}>{calc.presentDays}</Text>
                  <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>{t('present')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: theme.colors.warning }]}>{calc.halfDays}</Text>
                  <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>{t('half')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: theme.colors.error }]}>{calc.absentDays}</Text>
                  <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>{t('absent')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: theme.colors.info }]}>{calc.overtimeHours}</Text>
                  <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>{t('overtime')}</Text>
                </View>
              </View>

              <View style={[styles.salaryBreakdown, { borderTopColor: theme.colors.borderSoft }]}>
                <View style={styles.bdRow}>
                  <Text style={[styles.bdLabel, { color: theme.colors.textSecondary }]}>{t('baseEarnings')}</Text>
                  <Text style={[styles.bdValue, { color: theme.colors.text }]}>₹{calc.baseEarnings.toFixed(0)}</Text>
                </View>
                <View style={styles.bdRow}>
                  <Text style={[styles.bdLabel, { color: theme.colors.textSecondary }]}>{t('otEarnings')}</Text>
                  <Text style={[styles.bdValue, { color: theme.colors.text }]}>₹{calc.otEarnings.toFixed(0)}</Text>
                </View>
                <View style={styles.bdRow}>
                  <Text style={[styles.bdLabel, { color: theme.colors.textSecondary }]}>{t('advancePaid')}</Text>
                  <Text style={[styles.bdValue, { color: theme.colors.error }]}>- ₹{calc.advancePaid.toFixed(0)}</Text>
                </View>
                <View style={[styles.bdRowTotal, { borderTopColor: theme.colors.border }]}>
                  <Text style={styles.bdTotalLabel}>{t('netPayable')}</Text>
                  <Text style={styles.bdTotalValue}>₹{calc.remaining.toFixed(0)}</Text>
                </View>
              </View>

              <View style={styles.salaryActions}>
                <TouchableOpacity
                  style={[styles.salaryActionBtn, { borderColor: theme.colors.border }]}
                  onPress={() => { setSelectedWorker(worker.id); setAdvanceModal(true); }}>
                  <Plus color={theme.colors.primary} size={16} />
                  <Text style={[styles.salaryActionText, { color: theme.colors.primary }]}>{t('payAdvance')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.salaryActionBtn, paid && { backgroundColor: theme.colors.successSoft, borderColor: 'transparent' }]}
                  onPress={() => markSalaryPaid(worker.id, month, year)}>
                  <CheckCircle2 color={paid ? theme.colors.success : theme.colors.primary} size={16} />
                  <Text style={[styles.salaryActionText, { color: paid ? theme.colors.success : theme.colors.primary }]}>
                    {paid ? t('paid') : t('markPaid')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Advance Modal */}
      <Modal visible={advanceModal} animationType="slide" transparent onRequestClose={() => setAdvanceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.advanceSheet, { backgroundColor: theme.colors.card }]}>
            <View style={styles.advanceHeader}>
              <Text style={[styles.advanceTitle, { color: theme.colors.text }]}>{t('payAdvance')}</Text>
              <TouchableOpacity onPress={() => setAdvanceModal(false)}>
                <Text style={[styles.advanceClose, { color: theme.colors.textSecondary }]}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.advanceInput, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
              <Text style={[styles.advancePrefix, { color: theme.colors.textSecondary }]}>₹</Text>
              <TextInput
                style={[styles.advanceInputField, { color: theme.colors.text }]}
                placeholder={t('enterAmount')}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={advanceAmount}
                onChangeText={setAdvanceAmount}
                autoFocus
              />
            </View>
            <View style={[styles.advanceInput, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.advanceInputField, { color: theme.colors.text }]}
                placeholder={t('enterNotes')}
                placeholderTextColor={theme.colors.textMuted}
                value={advanceNote}
                onChangeText={setAdvanceNote}
              />
            </View>

            {workerAdvances.length > 0 && (
              <View style={styles.advanceHistory}>
                <Text style={[styles.advanceHistoryTitle, { color: theme.colors.textSecondary }]}>{t('advancePaid')}</Text>
                {workerAdvances.map((a) => (
                  <View key={a.id} style={styles.advanceHistRow}>
                    <Text style={[styles.advanceHistDate, { color: theme.colors.textSecondary }]}>{a.date}</Text>
                    <Text style={[styles.advanceHistAmt, { color: theme.colors.error }]}>₹{a.amount}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.advanceSaveBtn} onPress={handleAddAdvance}>
              <Text style={styles.advanceSaveText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 24 },
  monthNav: { padding: 4 },
  monthText: { fontSize: 18, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 20, padding: 20, justifyContent: 'center' },
  summaryLabel: { color: '#ffffffcc', fontSize: 13, fontWeight: '500', marginTop: 8 },
  summaryValue: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  summaryCol: { flex: 1, gap: 12 },
  summaryCardSmall: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, justifyContent: 'center' },
  summarySmallLabel: { fontSize: 12, fontWeight: '500', marginTop: 6 },
  summarySmallValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  salaryCard: { marginBottom: 14, padding: 16 },
  salaryTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  salaryAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  salaryAvatarText: { fontSize: 18, fontWeight: '700' },
  salaryInfo: { flex: 1 },
  salaryName: { fontSize: 16, fontWeight: '700' },
  salaryType: { fontSize: 13, marginTop: 2 },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  paidText: { fontSize: 12, fontWeight: '700' },
  salaryStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 12, marginTop: 2 },
  salaryBreakdown: { paddingTop: 12, borderTopWidth: 1, gap: 8 },
  bdRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bdLabel: { fontSize: 14 },
  bdValue: { fontSize: 14, fontWeight: '600' },
  bdRowTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, marginTop: 4 },
  bdTotalLabel: { fontSize: 16, fontWeight: '800', color: '#0B7A4B' },
  bdTotalValue: { fontSize: 18, fontWeight: '900', color: '#0B7A4B' },
  salaryActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  salaryActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  salaryActionText: { fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  advanceSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  advanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  advanceTitle: { fontSize: 20, fontWeight: '700' },
  advanceClose: { fontSize: 15, fontWeight: '600' },
  advanceInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, marginBottom: 12 },
  advancePrefix: { fontSize: 20, fontWeight: '700', marginRight: 8 },
  advanceInputField: { flex: 1, paddingVertical: 16, fontSize: 18 },
  advanceHistory: { marginTop: 8, marginBottom: 16 },
  advanceHistoryTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  advanceHistRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  advanceHistDate: { fontSize: 14 },
  advanceHistAmt: { fontSize: 14, fontWeight: '700' },
  advanceSaveBtn: { backgroundColor: '#0B7A4B', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  advanceSaveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
