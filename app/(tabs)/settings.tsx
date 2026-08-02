import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Share, Platform, Alert } from 'react-native';
import { useApp } from '@/store/AppContext';
import { Card } from '@/components/ui';
import { Globe, Moon, Bell, Cloud, Info, Star, Share2, ChevronRight, Check, Database, Trash2, User, LogOut, Shield } from 'lucide-react-native';
import { LANGUAGES, type Language } from '@/constants/i18n';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { settings, setLanguage, setThemeMode, toggleTheme, setNotificationsEnabled, setAutoBackup, createBackup, restoreBackup, deleteAllData, setUser, t, theme } = useApp();
  const [langModal, setLangModal] = useState(false);
  const [backupModal, setBackupModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const handleBackup = async () => {
    const ok = await createBackup();
    setBackupStatus(ok ? t('backupSuccess') : t('somethingWrong'));
    setTimeout(() => setBackupStatus(null), 2500);
  };

  const handleRestore = async () => {
    const ok = await restoreBackup();
    setBackupModal(false);
    Alert.alert(ok ? t('restoreSuccess') : t('somethingWrong'));
  };

  const handleDeleteAll = async () => {
    await deleteAllData();
    setDeleteModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    router.replace('/login');
  };

  const handleShare = () => {
    Share.share({ message: 'Hazari Book - Worker & Salary Manager. Download now!' }).catch(() => {});
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <View style={[styles.profileAvatar, { backgroundColor: theme.colors.primarySoft }]}>
          <User color={theme.colors.primary} size={28} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.colors.text }]}>{settings.user?.name || t('guest')}</Text>
          <Text style={[styles.profilePhone, { color: theme.colors.textSecondary }]}>{settings.user?.phone || (settings.user?.isGuest ? t('guest') : '')}</Text>
        </View>
        {!settings.user?.isGuest && (
          <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: theme.colors.errorSoft }]}>
            <LogOut color={theme.colors.error} size={18} />
          </TouchableOpacity>
        )}
      </Card>

      {/* Language */}
      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{t('language')}</Text>
      <Card style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setLangModal(true)}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
            <Globe color={theme.colors.primary} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('language')}</Text>
          <Text style={[styles.menuValue, { color: theme.colors.textSecondary }]}>
            {LANGUAGES.find((l) => l.code === settings.language)?.nativeLabel}
          </Text>
          <ChevronRight color={theme.colors.textMuted} size={20} />
        </TouchableOpacity>
      </Card>

      {/* Appearance */}
      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{t('darkMode')}</Text>
      <Card style={styles.menuCard}>
        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
            <Moon color={theme.colors.primary} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('darkMode')}</Text>
          <Switch
            value={settings.themeMode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#cbd5e1', true: '#0B7A4B' }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      {/* Notifications */}
      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{t('notifications')}</Text>
      <Card style={styles.menuCard}>
        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.infoSoft }]}>
            <Bell color={theme.colors.info} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('enableNotifications')}</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#cbd5e1', true: '#0B7A4B' }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      {/* Backup & Restore */}
      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{t('backupRestore')}</Text>
      <Card style={styles.menuCard}>
        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
            <Cloud color={theme.colors.primary} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('enableAutoBackup')}</Text>
          <Switch
            value={settings.autoBackup}
            onValueChange={setAutoBackup}
            trackColor={{ false: '#cbd5e1', true: '#0B7A4B' }}
            thumbColor="#fff"
          />
        </View>
        <TouchableOpacity style={styles.menuItem} onPress={handleBackup}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.successSoft }]}>
            <Cloud color={theme.colors.success} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('backupNow')}</Text>
          <Text style={[styles.menuValue, { color: theme.colors.textSecondary }]}>
            {settings.lastBackup ? new Date(settings.lastBackup).toLocaleDateString() : t('never')}
          </Text>
          <ChevronRight color={theme.colors.textMuted} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setBackupModal(true)}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.warningSoft }]}>
            <Database color={theme.colors.warning} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('restoreBackup')}</Text>
          <ChevronRight color={theme.colors.textMuted} size={20} />
        </TouchableOpacity>
      </Card>

      {backupStatus && (
        <View style={[styles.statusBanner, { backgroundColor: theme.colors.successSoft }]}>
          <Check color={theme.colors.success} size={18} />
          <Text style={[styles.statusText, { color: theme.colors.success }]}>{backupStatus}</Text>
        </View>
      )}

      {/* About */}
      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{t('about')}</Text>
      <Card style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.warningSoft }]}>
            <Star color={theme.colors.warning} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('rateApp')}</Text>
          <ChevronRight color={theme.colors.textMuted} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.infoSoft }]}>
            <Share2 color={theme.colors.info} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('shareApp')}</Text>
          <ChevronRight color={theme.colors.textMuted} size={20} />
        </TouchableOpacity>
        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.border }]}>
            <Info color={theme.colors.textSecondary} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('version')}</Text>
          <Text style={[styles.menuValue, { color: theme.colors.textSecondary }]}>1.0.0</Text>
        </View>
      </Card>

      {/* Danger Zone */}
      <Text style={[styles.sectionLabel, { color: theme.colors.error }]}>{t('deleteAllData')}</Text>
      <Card style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setDeleteModal(true)}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.errorSoft }]}>
            <Trash2 color={theme.colors.error} size={20} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.error }]}>{t('deleteAllData')}</Text>
          <ChevronRight color={theme.colors.textMuted} size={20} />
        </TouchableOpacity>
      </Card>

      <Text style={[styles.footer, { color: theme.colors.textMuted }]}>{t('madeWith')} · {t('allRightsReserved')}</Text>

      {/* Language Modal */}
      <Modal visible={langModal} animationType="slide" transparent onRequestClose={() => setLangModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.langSheet, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.langSheetTitle, { color: theme.colors.text }]}>{t('language')}</Text>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[styles.langRow, settings.language === l.code && { backgroundColor: theme.colors.primarySoft }]}
                onPress={() => { setLanguage(l.code as Language); setLangModal(false); }}>
                <Text style={[styles.langNative, { color: theme.colors.text }]}>{l.nativeLabel}</Text>
                <Text style={[styles.langLabel, { color: theme.colors.textSecondary }]}>{l.label}</Text>
                {settings.language === l.code && <Check color={theme.colors.primary} size={20} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Restore Confirm */}
      <Modal visible={backupModal} animationType="fade" transparent onRequestClose={() => setBackupModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmSheet, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.confirmIcon, { backgroundColor: theme.colors.warningSoft }]}>
              <Database color={theme.colors.warning} size={28} />
            </View>
            <Text style={[styles.confirmTitle, { color: theme.colors.text }]}>{t('restoreBackup')}</Text>
            <Text style={[styles.confirmSub, { color: theme.colors.textSecondary }]}>{t('restoreBackup')}</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={[styles.confirmBtn, { borderColor: theme.colors.border }]} onPress={() => setBackupModal(false)}>
                <Text style={[styles.confirmBtnText, { color: theme.colors.text }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtnPrimary} onPress={handleRestore}>
                <Text style={styles.confirmBtnTextPrimary}>{t('restore')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirm */}
      <Modal visible={deleteModal} animationType="fade" transparent onRequestClose={() => setDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmSheet, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.confirmIcon, { backgroundColor: theme.colors.errorSoft }]}>
              <Trash2 color={theme.colors.error} size={28} />
            </View>
            <Text style={[styles.confirmTitle, { color: theme.colors.text }]}>{t('deleteAllData')}</Text>
            <Text style={[styles.confirmSub, { color: theme.colors.textSecondary }]}>{t('deleteAllConfirm')}</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={[styles.confirmBtn, { borderColor: theme.colors.border }]} onPress={() => setDeleteModal(false)}>
                <Text style={[styles.confirmBtnText, { color: theme.colors.text }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtnDanger} onPress={handleDeleteAll}>
                <Text style={styles.confirmBtnTextDanger}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700' },
  profilePhone: { fontSize: 14, marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4, marginTop: 16 },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600' },
  menuValue: { fontSize: 14, fontWeight: '500' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 14, marginTop: 8 },
  statusText: { fontSize: 14, fontWeight: '600' },
  footer: { fontSize: 13, textAlign: 'center', marginTop: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  langSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  langSheetTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  langRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderRadius: 12, paddingHorizontal: 12, gap: 10 },
  langNative: { fontSize: 18, fontWeight: '700' },
  langLabel: { fontSize: 14, flex: 1 },
  confirmSheet: { margin: 24, borderRadius: 24, padding: 28, alignItems: 'center' },
  confirmIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  confirmSub: { fontSize: 14, textAlign: 'center' },
  confirmActions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  confirmBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  confirmBtnText: { fontSize: 15, fontWeight: '700' },
  confirmBtnPrimary: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#0B7A4B' },
  confirmBtnTextPrimary: { color: '#fff', fontSize: 15, fontWeight: '700' },
  confirmBtnDanger: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#DC2626' },
  confirmBtnTextDanger: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
