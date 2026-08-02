import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useApp } from '@/store/AppContext';

export default function SplashScreen() {
  const { settings } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (settings.user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [settings.user]);

  return (
    <LinearGradient colors={['#0B7A4B', '#095C39', '#0B7A4B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <View style={styles.logoWrap}>
        <LinearGradient colors={['#ffffff', '#e6f4ee']} style={styles.logoCircle}>
          <Text style={styles.logoText}>હ</Text>
        </LinearGradient>
      </View>
      <Text style={styles.appName}>હજરી બુક</Text>
      <Text style={styles.tagline}>કામદાર અને પગાર વ્યવસ્થાપક</Text>
      <View style={styles.loadingBar} />
      <Text style={styles.madeIn}>Made in India</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#0B7A4B',
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#ffffffcc',
    marginBottom: 40,
  },
  loadingBar: {
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#ffffff55',
    overflow: 'hidden',
  },
  madeIn: {
    position: 'absolute',
    bottom: 40,
    fontSize: 13,
    color: '#ffffffaa',
  },
});
