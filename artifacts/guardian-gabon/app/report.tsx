import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type AbuseType = "sexual" | "violence" | "both";

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addReport } = useApp();
  const isWeb = Platform.OS === "web";

  const [reporterName, setReporterName] = useState("");
  const [reporterAge, setReporterAge] = useState("");
  const [victimAge, setVictimAge] = useState("");
  const [abuseType, setAbuseType] = useState<AbuseType>("sexual");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mediaUri, setMediaUri] = useState<string | undefined>();
  const [mediaMimeType, setMediaMimeType] = useState<string | undefined>();
  const [mediaType, setMediaType] = useState<"photo" | "video" | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const descWordCount = description.trim().split(/\s+/).filter(Boolean).length;

  const pickMedia = async () => {
    if (isWeb) {
      Alert.alert("Info", "La sélection de médias est disponible sur l'application mobile.");
      return;
    }
    Alert.alert("Ajouter une preuve", "Choisissez le type de fichier", [
      {
        text: "Photo",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            setMediaUri(result.assets[0].uri);
            setMediaMimeType(result.assets[0].mimeType || "image/jpeg");
            setMediaType("photo");
          }
        },
      },
      {
        text: "Vidéo",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 0.6,
          });
          if (!result.canceled && result.assets[0]) {
            setMediaUri(result.assets[0].uri);
            setMediaMimeType(result.assets[0].mimeType || "video/mp4");
            setMediaType("video");
          }
        },
      },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!reporterName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre nom complet.");
      return;
    }
    if (!reporterAge.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre âge.");
      return;
    }
    if (!victimAge.trim()) {
      Alert.alert("Erreur", "Veuillez entrer l'âge de la victime.");
      return;
    }
    if (description.trim().length < 50) {
      Alert.alert("Erreur", "Veuillez fournir une description plus détaillée (minimum 50 caractères).");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);

    try {
      const code = await addReport(
        {
          reporterName: reporterName.trim(),
          reporterAge: reporterAge.trim(),
          victimAge: victimAge.trim(),
          abuseType,
          description: description.trim(),
          location: location.trim(),
        },
        mediaUri,
        mediaMimeType,
        mediaType
      );
      setSubmitting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/report-success");
    } catch (e) {
      setSubmitting(false);
      Alert.alert(
        "Échec de l'envoi",
        e instanceof Error
          ? e.message
          : "Impossible d'envoyer le signalement. Vérifiez votre connexion Internet et réessayez.",
        [{ text: "OK" }]
      );
    }
  };

  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.confidentialBadge, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
          <Feather name="lock" size={14} color="#15803d" />
          <Text style={[styles.confidentialText, { color: "#15803d" }]}>
            Signalement anonyme — Vos informations personnelles sont confidentielles et visibles uniquement par l'administrateur
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Vos informations</Text>
        <Text style={[styles.sectionNote, { color: colors.mutedForeground }]}>
          Ces informations ne seront pas visibles publiquement
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Votre nom complet *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            value={reporterName}
            onChangeText={setReporterName}
            placeholder="Nom et prénom"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Votre âge *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              value={reporterAge}
              onChangeText={setReporterAge}
              placeholder="Âge"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Âge de la victime *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              value={victimAge}
              onChangeText={setVictimAge}
              placeholder="Âge"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Type d'abus</Text>
        <View style={styles.typeRow}>
          {(["sexual", "violence", "both"] as AbuseType[]).map((type) => {
            const labels = { sexual: "Abus sexuel", violence: "Violence", both: "Les deux" };
            const isSelected = abuseType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => { Haptics.selectionAsync(); setAbuseType(type); }}
              >
                <Text style={[styles.typeLabel, { color: isSelected ? colors.primaryForeground : colors.foreground }]}>
                  {labels[type]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Lieu / Localisation</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            value={location}
            onChangeText={setLocation}
            placeholder="Ville, quartier, lieu (optionnel)"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.foreground }]}>Description détaillée *</Text>
            <Text style={[styles.wordCount, { color: descWordCount >= 50 ? "#16a34a" : colors.mutedForeground }]}>
              {descWordCount} / 1000 mots
            </Text>
          </View>
          <TextInput
            style={[styles.textarea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            value={description}
            onChangeText={(t) => {
              const words = t.trim().split(/\s+/).filter(Boolean).length;
              if (words <= 1000) setDescription(t);
            }}
            placeholder="Décrivez avec précision ce qui s'est passé : les faits, le contexte, les personnes impliquées, les dates et lieux..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Preuve (photo ou vidéo)</Text>
          {mediaUri ? (
            <View style={styles.mediaPreview}>
              {mediaType === "photo" && (
                <Image source={{ uri: mediaUri }} style={styles.mediaImage} resizeMode="cover" />
              )}
              {mediaType === "video" && (
                <View style={[styles.videoPlaceholder, { backgroundColor: colors.secondary }]}>
                  <Feather name="video" size={32} color={colors.primary} />
                  <Text style={[styles.videoLabel, { color: colors.primary }]}>Vidéo sélectionnée</Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.removeMedia, { backgroundColor: "#ef4444" }]}
                onPress={() => { setMediaUri(undefined); setMediaMimeType(undefined); setMediaType(undefined); }}
              >
                <Feather name="x" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.mediaButton, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={pickMedia}
              activeOpacity={0.7}
            >
              <Feather name="upload" size={22} color={colors.primary} />
              <Text style={[styles.mediaButtonText, { color: colors.primary }]}>
                Ajouter une photo ou vidéo
              </Text>
              <Text style={[styles.mediaNote, { color: colors.mutedForeground }]}>Optionnel</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: submitting ? colors.muted : colors.primary }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <Text style={styles.submitText}>Envoi en cours...</Text>
          ) : (
            <>
              <Feather name="send" size={18} color="#fff" />
              <Text style={styles.submitText}>Soumettre le signalement</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  confidentialBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  confidentialText: { fontSize: 12, lineHeight: 17, flex: 1, fontWeight: "500" },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  sectionNote: { fontSize: 12, marginTop: -8 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wordCount: { fontSize: 12, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 200,
  },
  row: { flexDirection: "row", gap: 12 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  typeLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  mediaButton: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  mediaButtonText: { fontSize: 14, fontWeight: "600" },
  mediaNote: { fontSize: 12 },
  mediaPreview: { borderRadius: 12, overflow: "hidden", position: "relative" },
  mediaImage: { width: "100%", height: 180, borderRadius: 12 },
  videoPlaceholder: {
    height: 120,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  videoLabel: { fontSize: 14, fontWeight: "600" },
  removeMedia: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
