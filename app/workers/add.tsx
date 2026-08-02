import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/store/AppContext';
import { ArrowLeft, Camera, Check, User, Phone, Wallet, Briefcase, MapPin, Image as ImageIcon } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { Worker } from '@/types';

const WORK_TYPES = ['mason', 'labor', 'carpenter', 'electrician', 'plumber', 'painter', 'welder', 'helper', 'supervisor', 'other'];

export default function WorkerFormScreen() {
  const { workers, addWorker, updateWorker, t, theme } = useApp();
  const params = useLocalSearchParams<{ id?: string }>();
  const editing = params.id ? workers.find((w) => w.id === params.id) : null;

  const [name, setName] = useState(editing?.name || '');
  const [phone, setPhone] = useState(editing?.phone || '');
  const [dailyWage, setDailyWage] = useState(editing ? String(editing.dailyWage) : '');
  const [workType, setWorkType] = useState(editing?.workType || 'labor');
  const [address, setAddress] = useState(editing?.address || '');
  const [photo, setPhoto] = useState<string | null>(editing?.photo || null);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError(t('pleaseEnterName'));
      return;
    }
    const data = {
      name: name.trim(),
      phone: phone.trim(),
      dailyWage: Number(dailyWage) || 0,
      workType,
      address: address.trim(),
      photo,
    };
    if (editing) {
      updateWorker(editing.id, data);
    } else {
      addWorker(data);
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient colors={['#0B7A4B', '#095C39']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? t('editWorker') : t('addNewWorker')}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Check color="#fff" size={22} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={[styles.photoCircle, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}
            onPress={() => setPhoto(photo ? null : 'placeholder')}>
            {photo ? (
              <View style={styles.photoFill} />
            ) : (
              <Camera color={theme.colors.primary} size={32} />
            )}
          </TouchableOpacity>
          <View style={styles.photoActions}>
            <TouchableOpacity style={[styles.photoBtn, { borderColor: theme.colors.border }]} onPress={() => setPhoto('placeholder')}>
              <Camera color={theme.colors.primary} size={16} />
              <Text style={[styles.photoBtnText, { color: theme.colors.primary }]}>{t('takePhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtn, { borderColor: theme.colors.border }]} onPress={() => setPhoto('placeholder')}>
              <ImageIcon color={theme.colors.primary} size={16} />
              <Text style={[styles.photoBtnText, { color: theme.colors.primary }]}>{t('choosePhoto')}</Text>
            </TouchableOpacity>
            {photo && (
              <TouchableOpacity style={[styles.photoBtn, { borderColor: theme.colors.errorSoft }]} onPress={() => setPhoto(null)}>
                <Text style={[styles.photoBtnText, { color: theme.colors.error }]}>{t('removePhoto')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('name')} *</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.colors.inputBg, borderColor: error ? theme.colors.error : theme.colors.border }]}>
              <User color={theme.colors.textMuted} size={20} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={t('enterName')}
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={(v) => { setName(v); setError(''); }}
              />
            </View>
            {error ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text> : null}
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('phone')}</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
              <Phone color={theme.colors.textMuted} size={20} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={t('enterPhone')}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Daily Wage */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('dailyWage')} (₹)</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
              <Wallet color={theme.colors.textMuted} size={20} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={t('enterWage')}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={dailyWage}
                onChangeText={setDailyWage}
              />
              <Text style={[styles.inputSuffix, { color: theme.colors.textMuted }]}>{t('perDay')}</Text>
            </View>
          </View>

          {/* Work Type */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('workType')}</Text>
            <View style={styles.chipRow}>
              {WORK_TYPES.map((wt) => (
                <TouchableOpacity
                  key={wt}
                  style={[
                    styles.chip,
                    workType === wt && styles.chipActive,
                    {
                      backgroundColor: workType === wt ? '#0B7A4B' : theme.colors.inputBg,
                      borderColor: workType === wt ? '#0B7A4B' : theme.colors.border,
                    },
                  ]}
                  onPress={() => setWorkType(wt)}>
                  <Text style={[styles.chipText, { color: workType === wt ? '#fff' : theme.colors.text }]}>{t(wt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('address')}</Text>
            <View style={[styles.inputWrap, styles.inputWrapMultiline, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
              <MapPin color={theme.colors.textMuted} size={20} style={{ marginTop: 4 }} />
              <TextInput
                style={[styles.input, styles.inputMultiline, { color: theme.colors.text }]}
                placeholder={t('enterAddress')}
                placeholderTextColor={theme.colors.textMuted}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: 50,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ffffff20', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  saveBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ffffff20', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  photoSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  photoCircle: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  photoFill: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#ccc' },
  photoActions: { flex: 1, gap: 8 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  photoBtnText: { fontSize: 13, fontWeight: '600' },
  formCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, gap: 10 },
  inputWrapMultiline: { alignItems: 'flex-start', paddingVertical: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  inputMultiline: { minHeight: 60, paddingVertical: 0 },
  inputSuffix: { fontSize: 13, fontWeight: '600' },
  errorText: { fontSize: 13, marginTop: 6, marginLeft: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipActive: {},
  chipText: { fontSize: 13, fontWeight: '600' },
});
