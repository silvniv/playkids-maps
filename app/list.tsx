import React, { useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { usePlaces } from '../src/hooks/usePlaces';
import { PlaceCard } from '../src/components/PlaceCard';
import { colors, spacing, typography } from '../src/constants/theme';

export default function ListScreen() {
  const router = useRouter();
  const { data: places, isLoading, error, refetch } = usePlaces();
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Carregando locais...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Erro ao carregar. Verifique sua configuração do Supabase.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={places || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceCard place={item} onPress={() => router.push(`/place/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.title}>Nenhum local encontrado</Text>
            <Text style={styles.muted}>Tente remover filtros ou adicionar um novo local.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xs },
  muted: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
