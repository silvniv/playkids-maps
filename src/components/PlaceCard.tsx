import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Place } from '../types';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

export function PlaceCard({ place, onPress }: { place: Place; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <Text style={styles.title}>{place.name}</Text>
      <Text style={styles.subtitle}>
        {(place.neighborhood || 'Campo Grande') + ' • ' + (place.address_approx || 'Endereço aprox.')}
      </Text>
      {!!place.status && place.status !== 'verified' && (
        <Text style={styles.badge}>{place.status}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: { ...typography.body, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.caption, color: colors.textMuted },
  badge: { ...typography.caption, color: colors.warning, marginTop: 6, fontWeight: '600' },
});
