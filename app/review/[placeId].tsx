import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateReview } from '../../src/hooks/useReviews';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function ReviewScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();

  const [safety, setSafety] = useState('5');
  const [infra, setInfra] = useState('5');
  const [ageRange, setAgeRange] = useState<'0-2' | '3-5' | '6-8' | '9-12' | 'mixed'>('mixed');
  const [comment, setComment] = useState('');
  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().slice(0, 10));

  const createReview = useCreateReview();

  const submit = async () => {
    const s = Number(safety);
    const i = Number(infra);
    if (s < 1 || s > 5 || i < 1 || i > 5) {
      Alert.alert('Notas inválidas', 'Use valores de 1 a 5.');
      return;
    }
    if (comment.length > 240) {
      Alert.alert('Comentário muito grande', 'Máximo 240 caracteres.');
      return;
    }

    try {
      await createReview.mutateAsync({
        place_id: placeId!,
        safety_rating: s,
        infra_rating: i,
        age_range: ageRange,
        comment,
        visited_at: visitedAt,
      } as any);

      Alert.alert('Avaliação enviada!');
      router.back();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível enviar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avaliar local</Text>

      <Text style={styles.label}>Segurança (1-5)</Text>
      <TextInput style={styles.input} keyboardType="number-pad" value={safety} onChangeText={setSafety} />

      <Text style={styles.label}>Infraestrutura (1-5)</Text>
      <TextInput style={styles.input} keyboardType="number-pad" value={infra} onChangeText={setInfra} />

      <Text style={styles.label}>Faixa etária recomendada</Text>
      <TextInput
        style={styles.input}
        value={ageRange}
        onChangeText={(t) => setAgeRange(t as any)}
        placeholder="mixed | 0-2 | 3-5 | 6-8 | 9-12"
      />

      <Text style={styles.label}>Data da visita (AAAA-MM-DD)</Text>
      <TextInput style={styles.input} value={visitedAt} onChangeText={setVisitedAt} />

      <Text style={styles.label}>Comentário (até 240)</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity style={styles.button} onPress={submit} disabled={createReview.isPending}>
        <Text style={styles.buttonText}>{createReview.isPending ? 'Enviando...' : 'Enviar avaliação'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.sm },
  button: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: borderRadius.md, marginTop: spacing.md },
  buttonText: { color: colors.surface, fontWeight: '600', textAlign: 'center' },
});
