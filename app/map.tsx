import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import { usePlaces } from "../src/hooks/usePlaces";
import { colors, spacing, typography } from "../src/constants/theme";
import { placesService } from "../src/services/placesService";
import { supabase } from "../src/services/supabase";

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const { data: places, isLoading, error, refetch } = usePlaces();

  const [draftCoord, setDraftCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("parque");
  const [neighborhood, setNeighborhood] = useState("");
  const [saving, setSaving] = useState(false);

  const markers = useMemo(() => (places ?? []).filter(p => p.lat != null && p.lng != null), [places]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!markers.length) return;

    const coords = markers.map(p => ({
      latitude: Number(p.lat),
      longitude: Number(p.lng),
    }));

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  }, [markers]);

  const initialRegion = {
    latitude: -20.4697,
    longitude: -54.6201,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Carregando mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Erro ao carregar locais do Supabase.</Text>
      </View>
    );
  }

  const openCreateModal = async (coord: { latitude: number; longitude: number }) => {
    setDraftCoord(coord);
    setName("");
    setCategory("parque");
    setNeighborhood("");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!draftCoord) return;
    if (!name.trim()) {
      Alert.alert("Nome obrigatório", "Digite um nome para o local.");
      return;
    }

    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      Alert.alert(
        "Faça login",
        "Para salvar um local, entre na aba Perfil e faça login. Depois volte aqui e toque em Salvar novamente."
      );
      return;
    }

    try {
      setSaving(true);
      await placesService.createPlace({
        name: name.trim(),
        category: category.trim() || "parque",
        lat: Number(draftCoord.latitude),
        lng: Number(draftCoord.longitude),
        neighborhood: neighborhood.trim() ? neighborhood.trim() : null,
        created_by: session.user.id,
      });
      setModalVisible(false);
      setDraftCoord(null);
      await refetch();
      Alert.alert("Local adicionado", "Seu local foi salvo no Supabase.");
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? "Erro desconhecido");
      if (msg.toLowerCase().includes("row-level security") || msg.toLowerCase().includes("rls")) {
        Alert.alert(
          "Bloqueado pelo Supabase",
          "Sua tabela places está com RLS ligado sem policy de INSERT. Crie uma policy permitindo INSERT para authenticated, ou desative RLS para teste."
        );
      } else {
        Alert.alert("Falha ao salvar", msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onLongPress={(e) => openCreateModal(e.nativeEvent.coordinate)}
      >
        {markers.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: Number(p.lat), longitude: Number(p.lng) }}
            title={p.name}
            description={p.neighborhood ?? ""}
            onCalloutPress={() => router.push(`/place/${p.id}`)}
          />
        ))}

        {draftCoord && (
          <Marker
            key="__draft__"
            coordinate={draftCoord}
            title="Novo local"
            description="Toque para editar e salvar"
            onPress={() => openCreateModal(draftCoord)}
          />
        )}
      </MapView>

      <View style={styles.tipOverlay}>
        <Text style={styles.tipText}>Segure no mapa para adicionar um novo local</Text>
      </View>

      {!markers.length && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.title}>Nenhum local para marcar</Text>
          <Text style={styles.muted}>Sua tabela places está vazia ou sem lat/lng.</Text>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adicionar local</Text>

            <Text style={styles.modalLabel}>Nome</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Praça do Rádio"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
            />

            <Text style={styles.modalLabel}>Categoria</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Ex: parque"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
            />

            <Text style={styles.modalLabel}>Bairro (opcional)</Text>
            <TextInput
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Ex: Centro"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondary]}
                onPress={() => {
                  setModalVisible(false);
                  setDraftCoord(null);
                }}
                disabled={saving}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={[styles.modalButtonText, { color: colors.surface }]}>
                  {saving ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xs, textAlign: "center" },
  muted: { ...typography.body, color: colors.textMuted, textAlign: "center" },
  tipOverlay: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipText: { ...typography.caption, color: colors.textMuted, textAlign: "center" },
  emptyOverlay: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    top: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { ...typography.title, color: colors.text, marginBottom: spacing.sm, textAlign: "center" },
  modalLabel: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xs },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  modalRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  modalButton: { flex: 1, padding: spacing.sm, borderRadius: 12, alignItems: "center" },
  modalPrimary: { backgroundColor: colors.primary },
  modalSecondary: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  modalButtonText: { fontWeight: "600" },
});
