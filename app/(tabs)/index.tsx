import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/store/AppContext';
import { Card, StatCard, EmptyState, SectionTitle } from '@/components/ui';
import { Users, CheckCircle2, XCircle, Clock, Wallet, UserPlus, CalendarCheck, BarChart3, Bell, Moon, Sun } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { workers, attendance, t, theme, settings, toggleTheme } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayAtt = attendance.filter((a) => a.date === today);
  const present = todayAtt.filter((a) => a.status === 'present').length;
  const absent = todayAtt.filter((a) => a.status === 'absent').length;
  const halfDay = todayAtt.filter((a) => a.status === 'half').length;

  const todaySalary = todayAtt.reduce((sum, a) => {
    const worker = workers.find((w) => w.id === a.workerId);
    if (!worker) return sum;
    let earned = 0;
    if (a.status === 'present') earned = worker.dailyWage;
    else if (a.status === 'half') earned = worker.dailyWage / 2;
    const otRate = worker.dailyWage / 8;
    earned += (a.overtimeHours || 0) * otRate;
    return sum + earned;
  }, 0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 17) return t('goodAfternoon');
    return t('goodEvening');
  })();

  const quickActions = [
    { label: t('addWorker'), icon: <UserPlus color="#fff" size={22} />, color: '#0B7A4B', route: '/workers?action=add' },
    { label: t('markAttendance'), icon: <CalendarCheck color="#fff" size={22} />, color: '#2563EB', route: '/attendance' },
    { label: t('viewSalary'), icon: <Wallet color="#fff" size={22} />, color: '#F59E0B', route: '/salary' },
    { label: t('viewReports'), icon: <BarChart3 color="#fff" size={22} />, color: '#7C3AED', route: '/reports' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B7A4B']} />}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#0B7A4B', '#095C39']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{settings.user?.name || t('guest')}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon} onPress={toggleTheme}>
              {settings.themeMode === 'dark' ? <Sun color="#fff" size={20} /> : <Moon color="#fff" size={20} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Bell color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.appName}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard label={t('totalWorkers')} value={workers.length} color="#0B7A4B" icon={<Users color="#0B7A4B" size={22} />} />
        <StatCard label={t('presentToday')} value={present} color="#16A34A" icon={<CheckCircle2 color="#16A34A" size={22} />} />
        <StatCard label={t('absentToday')} value={absent} color="#DC2626" icon={<XCircle color="#DC2626" size={22} />} />
        <StatCard label={t('halfDay')} value={halfDay} color="#F59E0B" icon={<Clock color="#F59E0B" size={22} />} />
      </View>

      {/* Today's Salary Banner */}
      <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.salaryBanner}>
        <View>
          <Text style={styles.salaryLabel}>{t('todaySalary')}</Text>
          <Text style={styles.salaryValue}>₹{todaySalary.toFixed(0)}</Text>
        </View>
        <View style={styles.salaryIconWrap}>
          <Wallet color="#fff" size={32} />
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <SectionTitle title={t('quickActions')} />
        <View style={styles.quickGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickItem}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.85}>
              <LinearGradient colors={[action.color, action.color + 'dd']} style={styles.quickIcon}>
                {action.icon}
              </LinearGradient>
              <Text style={[styles.quickLabel, { color: theme.colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <SectionTitle title={t('recentActivity')} />
        {workers.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Users color="#0B7A4B" size={32} />}
              title={t('noWorkersYet')}
              subtitle={t('noWorkersSub')}
              action={
                <TouchableOpacity style={styles.addFirstBtn} onPress={() => router.push('/workers?action=add' as any)}>
                  <Text style={styles.addFirstText}>{t('addFirstWorker')}</Text>
                </TouchableOpacity>
              }
            />
          </Card>
        ) : (
          <View>
            {workers.slice(0, 4).map((w) => {
              const att = todayAtt.find((a) => a.workerId === w.id);
              const statusColor = att?.status === 'present' ? '#16A34A' : att?.status === 'half' ? '#F59E0B' : att?.status === 'absent' ? '#DC2626' : '#94A3B8';
              return (
                <Card key={w.id} style={styles.workerRow}>
                  <View style={[styles.workerAvatar, { backgroundColor: theme.colors.primarySoft }]}>
                    <Text style={[styles.workerInitial, { color: theme.colors.primary }]}>{w.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.workerInfo}>
                    <Text style={[styles.workerName, { color: theme.colors.text }]}>{w.name}</Text>
                    <Text style={[styles.workerType, { color: theme.colors.textSecondary }]}>{t(w.workType)} · ₹{w.dailyWage}{t('perDay')}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  header: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
  paddingTop: 20,
  paddingBottom: 28,
  shadowColor: '#0B7A4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { color: '#ffffffcc', fontSize: 14, fontWeight: '500' },
  userName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 4 },
  tagline: { color: '#ffffffcc', fontSize: 14 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  section: { padding: 16, paddingTop: 20 },
  salaryBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  salaryLabel: { color: '#ffffffcc', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  salaryValue: { color: '#fff', fontSize: 32, fontWeight: '900' },
  salaryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ffffff25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickItem: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  addFirstBtn: {
    marginTop: 16,
    backgroundColor: '#0B7A4B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addFirstText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workerInitial: { fontSize: 18, fontWeight: '700' },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 16, fontWeight: '600' },
  workerType: { fontSize: 13, marginTop: 2 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
});
