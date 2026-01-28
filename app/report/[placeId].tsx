import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { reportsService } from '../../src/services/reportsService';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function ReportScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();

  const [type, setType] = useState('broken_toy');
  const [description, setDescription] = useState('');

  const submit = async () => {
    if (!description.trim()) {
      Alert.alert('Descreva o problema');
      return;
    }
    try {
      await reportsService.createReport(placeId!, type as any, description);
      Alert.alert('Relato enviado');
      router.back();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível enviar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatar problema</Text>

      <Text style={styles.label}>Tipo</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="broken_toy | risk | no_maintenance | dirty | bad_lighting | other"
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Ex: balanço quebrado, parafuso exposto..."
      />

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Enviar relato</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.sm },
  button: { backgroundColor: colors.danger, padding: spacing.sm, borderRadius: borderRadius.md, marginTop: spacing.md },
  buttonText: { color: colors.surface, fontWeight: '600', textAlign: 'center' },
});
