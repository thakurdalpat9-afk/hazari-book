import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useApp } from '@/store/AppContext';
import { Card, EmptyState, PrimaryButton } from '@/components/ui';
import { Users, Search, Plus, Pencil, Trash2, Phone, MapPin, Briefcase, Filter, X } from 'lucide-react-native';
import { router } from 'expo-router';
import type { Worker } from '@/types';

const WORK_TYPES = ['mason', 'labor', 'carpenter', 'electrician', 'plumber', 'painter', 'welder', 'helper', 'supervisor', 'other'];

export default function WorkersScreen() {
  const { workers, t, theme, deleteWorker } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'wageHigh' | 'wageLow'>('nameAsc');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);

  const filtered = useMemo(() => {
    let list = workers.filter(
      (w) =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.phone.includes(search),
    );
    if (filterType) list = list.filter((w) => w.workType === filterType);
    switch (sortBy) {
      case 'nameAsc': list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'nameDesc': list = [...list].sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'wageHigh': list = [...list].sort((a, b) => b.dailyWage - a.dailyWage); break;
      case 'wageLow': list = [...list].sort((a, b) => a.dailyWage - b.dailyWage); break;
    }
    return list;
  }, [workers, search, filterType, sortBy]);

  const handleDelete = () => {
    if (deleteTarget) {
      deleteWorker(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('workers')}</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}>
          <Filter color={theme.colors.primary} size={20} />
          {(filterType || sortBy !== 'nameAsc') && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Search color={theme.colors.textMuted} size={20} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('searchWorkers')}
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X color={theme.colors.textMuted} size={18} />
          </TouchableOpacity>
        )}
      </View>

      {/* Worker List */}
      {filtered.length === 0 ? (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <EmptyState
            icon={<Users color="#0B7A4B" size={32} />}
            title={search || filterType ? t('noResults') : t('noWorkersYet')}
            subtitle={search || filterType ? t('tryDifferent') : t('noWorkersSub')}
            action={
              !search && !filterType ? (
                <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/workers/add' as any)}>
                  <Plus color="#fff" size={20} />
                  <Text style={styles.addBtnText}>{t('addFirstWorker')}</Text>
                </TouchableOpacity>
              ) : undefined
            }
          />
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.workerCard}>
              <View style={styles.workerTop}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
                  {item.photo ? (
                    <View style={styles.photoWrap} />
                  ) : (
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{item.name.charAt(0)}</Text>
                  )}
                </View>
                <View style={styles.workerInfo}>
                  <Text style={[styles.workerName, { color: theme.colors.text }]}>{item.name}</Text>
                  <Text style={[styles.workerType, { color: theme.colors.textSecondary }]}>{t(item.workType)}</Text>
                  <Text style={[styles.workerWage, { color: theme.colors.primary }]}>₹{item.dailyWage}{t('perDay')}</Text>
                </View>
                <View style={styles.workerActions}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.primarySoft }]} onPress={() => router.push(`/workers/edit?id=${item.id}` as any)}>
                    <Pencil color={theme.colors.primary} size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.errorSoft }]} onPress={() => setDeleteTarget(item)}>
                    <Trash2 color={theme.colors.error} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
              {(item.phone || item.address) && (
                <View style={[styles.workerBottom, { borderTopColor: theme.colors.borderSoft }]}>
                  {item.phone ? (
                    <View style={styles.metaRow}>
                      <Phone color={theme.colors.textMuted} size={14} />
                      <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{item.phone}</Text>
                    </View>
                  ) : null}
                  {item.address ? (
                    <View style={styles.metaRow}>
                      <MapPin color={theme.colors.textMuted} size={14} />
                      <Text style={[styles.metaText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </Card>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/workers/add' as any)} activeOpacity={0.85}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.filterSheet, { backgroundColor: theme.colors.card }]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: theme.colors.text }]}>{t('filters')}</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X color={theme.colors.text} size={22} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>{t('selectWorkType')}</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, !filterType && styles.chipActive, { borderColor: filterType ? theme.colors.border : theme.colors.primary }]}
                onPress={() => setFilterType(null)}>
                <Text style={[styles.chipText, { color: filterType ? theme.colors.text : '#fff' }]}>{t('all')}</Text>
              </TouchableOpacity>
              {WORK_TYPES.map((wt) => (
                <TouchableOpacity
                  key={wt}
                  style={[styles.chip, filterType === wt && styles.chipActive, { borderColor: filterType === wt ? theme.colors.primary : theme.colors.border }]}
                  onPress={() => setFilterType(filterType === wt ? null : wt)}>
                  <Text style={[styles.chipText, { color: filterType === wt ? '#fff' : theme.colors.text }]}>{t(wt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.filterLabel, { color: theme.colors.textSecondary, marginTop: 16 }]}>{t('sortBy')}</Text>
            {(['nameAsc', 'nameDesc', 'wageHigh', 'wageLow'] as const).map((s) => (
              <TouchableOpacity key={s} style={styles.sortRow} onPress={() => setSortBy(s)}>
                <Text style={[styles.sortText, { color: theme.colors.text }]}>{t(s)}</Text>
                <View style={[styles.radio, sortBy === s && styles.radioActive, { borderColor: sortBy === s ? theme.colors.primary : theme.colors.border }]}>
                  {sortBy === s && <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />}
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterActionBtn, { borderColor: theme.colors.border }]}
                onPress={() => { setFilterType(null); setSortBy('nameAsc'); }}>
                <Text style={[styles.filterActionText, { color: theme.colors.text }]}>{t('reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterActionBtnPrimary} onPress={() => setShowFilters(false)}>
                <Text style={styles.filterActionTextPrimary}>{t('apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirm */}
      <Modal visible={!!deleteTarget} animationType="fade" transparent onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteSheet, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.deleteIcon, { backgroundColor: theme.colors.errorSoft }]}>
              <Trash2 color={theme.colors.error} size={28} />
            </View>
            <Text style={[styles.deleteTitle, { color: theme.colors.text }]}>{t('deleteConfirm')}</Text>
            <Text style={[styles.deleteSub, { color: theme.colors.textSecondary }]}>{t('deleteConfirmSub')}</Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={[styles.deleteBtn, { borderColor: theme.colors.border }]} onPress={() => setDeleteTarget(null)}>
                <Text style={[styles.deleteBtnText, { color: theme.colors.text }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtnDanger} onPress={handleDelete}>
                <Text style={styles.deleteBtnTextDanger}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  filterBtn: { padding: 8 },
  filterDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#0B7A4B' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15 },
  workerCard: { marginBottom: 12, padding: 16 },
  workerTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  photoWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ccc' },
  avatarText: { fontSize: 22, fontWeight: '700' },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 17, fontWeight: '700' },
  workerType: { fontSize: 13, marginTop: 2 },
  workerWage: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  workerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  workerBottom: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0B7A4B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B7A4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addBtn: { flexDirection: 'row', backgroundColor: '#0B7A4B', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '85%' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filterTitle: { fontSize: 20, fontWeight: '700' },
  filterLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipActive: { backgroundColor: '#0B7A4B' },
  chipText: { fontSize: 13, fontWeight: '600' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  sortText: { fontSize: 15 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioActive: {},
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  filterActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  filterActionBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  filterActionText: { fontSize: 15, fontWeight: '700' },
  filterActionBtnPrimary: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#0B7A4B' },
  filterActionTextPrimary: { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteSheet: { margin: 24, borderRadius: 24, padding: 28, alignItems: 'center' },
  deleteIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  deleteTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  deleteSub: { fontSize: 14, textAlign: 'center' },
  deleteActions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  deleteBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  deleteBtnText: { fontSize: 15, fontWeight: '700' },
  deleteBtnDanger: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#DC2626' },
  deleteBtnTextDanger: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
