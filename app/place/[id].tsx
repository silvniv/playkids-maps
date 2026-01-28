import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlace } from '../../src/hooks/usePlaces';
import { useReviews } from '../../src/hooks/useReviews';
import { useIsFavorite, useToggleFavorite } from '../../src/hooks/useFavorites';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: place, isLoading } = usePlace(id || '');
  const { data: reviews } = useReviews(id || '');
  const { data: isFav, refetch: refetchIsFav } = useIsFavorite(id || '');
  const toggleFav = useToggleFavorite();

  const [favoriteMsg, setFavoriteMsg] = useState<string | null>(null);
  const [favoriteErr, setFavoriteErr] = useState<string | null>(null);
  const favoriteMsgTimer = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (favoriteMsgTimer.current) clearTimeout(favoriteMsgTimer.current);
    };
  }, []);

  const showFavoriteMsg = (msg: string) => {
    setFavoriteMsg(msg);
    if (favoriteMsgTimer.current) clearTimeout(favoriteMsgTimer.current);
    favoriteMsgTimer.current = setTimeout(() => setFavoriteMsg(null), 1500);
  };

  if (isLoading || !place) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Carregando...</Text>
      </View>
    );
  }

  const infra = [
    place.infra_bathroom ? 'Banheiro' : null,
    place.infra_changing_table ? 'Fraldário' : null,
    place.infra_shade ? 'Sombra' : null,
    place.infra_water_fountain ? 'Bebedouro' : null,
    place.infra_fenced ? 'Cercado' : null,
    place.infra_toys ? 'Brinquedos' : null,
  ].filter(Boolean) as string[];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <View style={styles.header}>
        <Text style={styles.title}>{place.name}</Text>
        {place.status === 'pending' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Novo (pendente)</Text>
          </View>
        )}
        <Text style={styles.muted}>{place.neighborhood} • {place.address_approx}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notas</Text>
        <Text style={styles.body}>Segurança: {place.avg_safety ? place.avg_safety.toFixed(1) : 'N/A'} / 5</Text>
        <Text style={styles.body}>Infraestrutura: {place.avg_infra ? place.avg_infra.toFixed(1) : 'N/A'} / 5</Text>
        <Text style={styles.body}>Avaliações: {place.reviews_count ?? 0}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Infraestrutura</Text>
        <Text style={styles.body}>{infra.length ? infra.join(' • ') : 'Sem informações ainda.'}</Text>
        <Text style={styles.body}>Acessível: {place.accessibility ? 'Sim' : 'Não'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.body}>{place.description || 'Sem descrição.'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push(`/review/${place.id}`)}
        >
          <Text style={styles.primaryBtnText}>Avaliar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, toggleFav.isPending ? { opacity: 0.6 } : null]}
          disabled={toggleFav.isPending}
          onPress={async () => {
            setFavoriteErr(null);
            try {
              const wasFav = !!isFav;
              await toggleFav.mutate({ placeId: place.id, isFavorite: wasFav });
              await refetchIsFav();

              showFavoriteMsg(wasFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
            } catch (e: any) {
              const msg = e?.message ?? 'Não foi possível atualizar favorito.';
              setFavoriteErr(msg);
            }
          }}
        >
          <Text style={styles.secondaryBtnText}>{isFav ? 'Remover favorito' : 'Favoritar'}</Text>
        </TouchableOpacity>

        {!!favoriteMsg && <Text style={styles.feedbackOk}>{favoriteMsg}</Text>}
        {!!favoriteErr && <Text style={styles.feedbackErr}>{favoriteErr}</Text>}

        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => router.push(`/report/${place.id}`)}
        >
          <Text style={styles.dangerBtnText}>Relatar problema</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comentários</Text>
        {(reviews || []).slice(0, 10).map((r) => (
          <View key={r.id} style={styles.review}>
            <Text style={styles.reviewMeta}>Visitado em {r.visited_at} • Seg {r.safety_rating}/5 • Infra {r.infra_rating}/5</Text>
            <Text style={styles.body}>{r.comment}</Text>
          </View>
        ))}
        {!reviews?.length && <Text style={styles.muted}>Sem comentários ainda.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xs },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm, marginBottom: spacing.xs },
  badgeText: { color: colors.surface, fontSize: 12, fontWeight: '600' },
  muted: { ...typography.caption, color: colors.textMuted },
  section: { backgroundColor: colors.surface, padding: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { ...typography.body, fontWeight: '600', marginBottom: spacing.xs, color: colors.text },
  body: { ...typography.body, color: colors.text },
  actions: { marginBottom: spacing.md },
  primaryBtn: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.xs },
  primaryBtnText: { color: colors.surface, fontWeight: '600', textAlign: 'center' },
  secondaryBtn: { backgroundColor: colors.surface, padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  secondaryBtnText: { color: colors.secondary, fontWeight: '600', textAlign: 'center' },
  feedbackOk: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xs },
  feedbackErr: { ...typography.caption, color: colors.danger, textAlign: 'center', marginBottom: spacing.xs },
  dangerBtn: { backgroundColor: colors.danger, padding: spacing.sm, borderRadius: borderRadius.md },
  dangerBtnText: { color: colors.surface, fontWeight: '600', textAlign: 'center' },
  review: { marginTop: spacing.sm },
  reviewMeta: { ...typography.caption, color: colors.textMuted, marginBottom: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
});
