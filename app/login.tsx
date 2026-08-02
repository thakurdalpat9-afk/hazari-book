import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useApp } from '@/store/AppContext';
import { Phone, ChevronRight, ShieldCheck, CloudOff } from 'lucide-react-native';

export default function LoginScreen() {
  const { setUser, t } = useApp();
  const [step, setStep] = useState<'options' | 'phone'>('options');
  const [phone, setPhone] = useState('');

  const handleGoogle = () => {
    setUser({ name: 'Google User', phone: '', isGuest: false });
    router.replace('/(tabs)');
  };

  const handlePhone = () => {
    if (phone.length < 10) return;
    setUser({ name: 'Phone User', phone, isGuest: false });
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    setUser({ name: 'Guest', phone: '', isGuest: true });
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#0B7A4B', '#095C39']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>હ</Text>
          </View>
          <Text style={styles.appName}>{t('appName')}</Text>
          <Text style={styles.tagline}>{t('welcomeSub')}</Text>
        </View>

        {step === 'options' ? (
          <View style={styles.body}>
            <TouchableOpacity style={styles.loginBtn} onPress={handleGoogle} activeOpacity={0.85}>
              <View style={[styles.btnIcon, { backgroundColor: '#fff' }]}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.loginBtnText}>{t('loginGoogle')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: '#ffffff15' }]}
              onPress={() => setStep('phone')}
              activeOpacity={0.85}>
              <View style={[styles.btnIcon, { backgroundColor: '#0B7A4B' }]}>
                <Phone color="#fff" size={22} />
              </View>
              <Text style={styles.loginBtnText}>{t('loginPhone')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('skipLogin')}</Text>
              <ChevronRight color="#ffffffaa" size={18} />
            </TouchableOpacity>

            <View style={styles.noteWrap}>
              <CloudOff color="#ffffffaa" size={16} />
              <Text style={styles.noteText}>{t('loginNote')}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.phoneInputWrap}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="98765 43210"
                placeholderTextColor="#ffffff55"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            <TouchableOpacity style={styles.loginBtn} onPress={handlePhone} activeOpacity={0.85}>
              <View style={[styles.btnIcon, { backgroundColor: '#0B7A4B' }]}>
                <ShieldCheck color="#fff" size={22} />
              </View>
              <Text style={styles.loginBtnText}>{t('confirm')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('options')} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('back')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 48 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: { fontSize: 52, fontWeight: '900', color: '#0B7A4B' },
  appName: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 15, color: '#ffffffcc', textAlign: 'center', paddingHorizontal: 20 },
  body: { width: '100%' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  btnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  googleG: { fontSize: 22, fontWeight: '900', color: '#4285F4' },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#0B7A4B', flex: 1 },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 6,
  },
  skipText: { fontSize: 15, color: '#ffffffaa', marginRight: 4, fontWeight: '600' },
  noteWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    gap: 8,
  },
  noteText: { fontSize: 13, color: '#ffffff99', textAlign: 'center', flex: 1 },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff15',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  phonePrefix: { fontSize: 18, fontWeight: '700', color: '#fff', marginRight: 12 },
  phoneInput: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 16, letterSpacing: 1 },
});
