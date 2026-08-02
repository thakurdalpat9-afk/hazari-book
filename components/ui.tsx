import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/store/AppContext';
import type { AppTheme } from '@/constants/theme';

export function ThemedView({ children, style }: { children: React.ReactNode; style?: any }) {
  const { theme } = useApp();
  return <View style={[{ backgroundColor: theme.colors.background }, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  const { theme } = useApp();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        style,
      ]}>
      {children}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: any;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.85} style={[styles.primaryBtn, style]}>
      <LinearGradient colors={['#0B7A4B', '#10A062']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.btnContent}>
            {icon}
            <Text style={styles.primaryBtnText}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  title,
  onPress,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: any;
}) {
  const { theme } = useApp();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.secondaryBtn,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        style,
      ]}>
      <View style={styles.btnContent}>
        {icon}
        <Text style={[styles.secondaryBtnText, { color: theme.colors.text }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
}) {
  const { theme } = useApp();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>{icon}</View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { theme } = useApp();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primarySoft }]}>{icon}</View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

export function SectionTitle({ title }: { title: string }) {
  const { theme } = useApp();
  return <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});
