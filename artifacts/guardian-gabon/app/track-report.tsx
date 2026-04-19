import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { useApp, type Report } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const STEPS: { key: Report["status"]; label: string; sublabel: string; icon: React.ComponentProps<typeof Feather>["name"]; color: string }[] = [
  {
    key: "pending",
    label: "Signalement reçu",
    sublabel: "Votre dossier a été enregistré par les autorités.",
    icon: "inbox",
    color: "#d97706",
  },
  {
    key: "reviewed",
    label: "En cours d'examen",
    sublabel: "Les autorités examinent activement votre signalement.",
    icon: "search",
    color: "#2563eb",
  },
  {
    key: "closed",
    label: "Dossier clôturé",
    sublabel: "Le dossier a été traité. Merci pour votre signalement.",
    icon: "check-circle",
    color: "#16a34a",
  },
];

const STATUS_INDEX: Record<Report["status"], number> = { pending: 0, reviewed: 1, closed: 2 };

const ABUSE_LABELS = { sexual: "Abus sexuel", violence: "Violence", both: "Abus sexuel & Violence" };

export default function TrackReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fetchReportByCode } = useApp();
  const isWeb = Platform.OS === "web";
  const params = useLocalSearchParams<{ code?: string }>();

  const [code, setCode] = useState(params.code || "");
  const [result, setResult] = useState<Report | null | "not_found">(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (params.code && params.code.trim()) {
      const normalised = normaliseCode(params.code.trim());
      setCode(normalised);
      fetchReportByCode(normalised).then((report) => {
        setResult(report ?? "not_found");
        setSearched(true);
      });
    }
  }, []);

  const normaliseCode = (raw: string): string => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length === 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    return raw.toUpperCase();
  };

  const handleSearch = async () => {
    if (!code.trim() || searching) return;
    Haptics.selectionAsync();
    const normalised = normaliseCode(code.trim());
    setCode(normalised);
    setSearching(true);
    const report = await fetchReportByCode(normalised);
    setResult(report ?? "not_found");
    setSearched(true);
    setSearching(false);
  };

  const handleRefreshStatus = async () => {
    if (!result || result === "not_found" || refreshing) return;
    Haptics.selectionAsync();
    setRefreshing(true);
    const fresh = await fetchReportByCode(result.trackingCode);
    if (fresh) setResult(fresh);
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
    setSearched(false);
  };

  const bottomPad = isWeb ? 34 : insets.bottom;
  const activeIndex = result && result !== "not_found" ? STATUS_INDEX[result.status] : -1;

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
        {/* Header */}
        <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
          <Feather name="search" size={24} color="#ffffff" />
          <Text style={styles.headerTitle}>Suivi de signalement</Text>
          <Text style={styles.headerSubtitle}>
            Entrez votre code de suivi pour consulter l'état de votre dossier
          </Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
          <Feather name="shield" size={14} color="#15803d" />
          <Text style={[styles.infoText, { color: "#166534" }]}>
            Votre code de suivi vous a été fourni après votre signalement. Il vous permet de vérifier l'avancement de votre dossier de façon totalement anonyme.
          </Text>
        </View>

        {/* Search */}
        <View style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.searchLabel, { color: colors.foreground }]}>Code de suivi</Text>
          <View style={styles.searchRow}>
            <View style={[styles.searchInput, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Feather name="hash" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={code}
                onChangeText={(t) => {
                  setCode(t.toUpperCase());
                  if (searched) setSearched(false);
                }}
                placeholder="Ex: ABCD-1234"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity
              style={[styles.searchBtn, { backgroundColor: colors.primary, opacity: searching ? 0.7 : 1 }]}
              onPress={handleSearch}
              activeOpacity={0.85}
              disabled={searching}
            >
              {searching
                ? <ActivityIndicator size="small" color="#fff" />
                : <Feather name="search" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Not found */}
        {searched && result === "not_found" && (
          <View style={[styles.notFound, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
            <Feather name="alert-circle" size={32} color="#dc2626" />
            <Text style={[styles.notFoundTitle, { color: "#dc2626" }]}>Code introuvable</Text>
            <Text style={[styles.notFoundText, { color: "#991b1b" }]}>
              Aucun signalement ne correspond à ce code. Vérifiez que vous avez bien saisi le code (majuscules et tiret inclus).
            </Text>
            <TouchableOpacity style={[styles.resetBtn, { borderColor: "#dc2626" }]} onPress={handleReset}>
              <Text style={[styles.resetText, { color: "#dc2626" }]}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result */}
        {searched && result && result !== "not_found" && (
          <View style={styles.resultBlock}>

            {/* ══════════════════ BARRE DE PROGRESSION ══════════════════ */}
            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.progressTitle, { color: colors.foreground }]}>
                Progression du dossier
              </Text>

              {/* Barre horizontale */}
              <View style={styles.progressBarWrap}>
                {STEPS.map((step, i) => {
                  const isDone = i <= activeIndex;
                  const isActive = i === activeIndex;
                  return (
                    <React.Fragment key={step.key}>
                      <View style={styles.progressStepWrap}>
                        {/* Cercle */}
                        <View
                          style={[
                            styles.progressDot,
                            {
                              backgroundColor: isDone ? step.color : colors.muted,
                              borderColor: isDone ? step.color : colors.border,
                              width: isActive ? 40 : 32,
                              height: isActive ? 40 : 32,
                              borderRadius: isActive ? 20 : 16,
                            },
                          ]}
                        >
                          {isDone ? (
                            <Feather
                              name={isActive ? step.icon : "check"}
                              size={isActive ? 18 : 14}
                              color="#fff"
                            />
                          ) : (
                            <View style={[styles.dotInner, { backgroundColor: colors.border }]} />
                          )}
                        </View>
                        {/* Label sous le cercle */}
                        <Text
                          style={[
                            styles.progressStepLabel,
                            {
                              color: isDone ? step.color : colors.mutedForeground,
                              fontWeight: isActive ? "700" : "500",
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {step.label}
                        </Text>
                      </View>
                      {/* Ligne entre étapes */}
                      {i < STEPS.length - 1 && (
                        <View
                          style={[
                            styles.progressLine,
                            {
                              backgroundColor: i < activeIndex ? STEPS[i].color : colors.border,
                            },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>

              {/* Message de l'étape active */}
              <View
                style={[
                  styles.activeStepBanner,
                  { backgroundColor: STEPS[activeIndex].color + "15", borderColor: STEPS[activeIndex].color + "40" },
                ]}
              >
                <Feather name={STEPS[activeIndex].icon} size={18} color={STEPS[activeIndex].color} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activeStepLabel, { color: STEPS[activeIndex].color }]}>
                    {STEPS[activeIndex].label}
                  </Text>
                  <Text style={[styles.activeStepSub, { color: STEPS[activeIndex].color + "cc" }]}>
                    {STEPS[activeIndex].sublabel}
                  </Text>
                </View>
              </View>

              {/* Bouton actualiser */}
              <TouchableOpacity
                style={[styles.refreshBtn, { borderColor: colors.border, opacity: refreshing ? 0.6 : 1 }]}
                onPress={handleRefreshStatus}
                disabled={refreshing}
                activeOpacity={0.8}
              >
                {refreshing
                  ? <ActivityIndicator size="small" color={colors.mutedForeground} />
                  : <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />}
                <Text style={[styles.refreshText, { color: colors.mutedForeground }]}>
                  {refreshing ? "Mise à jour..." : "Actualiser le statut"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Infos du dossier */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.infoRow}>
                <Feather name="calendar" size={14} color={colors.mutedForeground} />
                <View>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Date de soumission</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {new Date(result.submittedAt).toLocaleDateString("fr-GA", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Feather name="alert-triangle" size={14} color={colors.mutedForeground} />
                <View>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Type d'abus signalé</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {ABUSE_LABELS[result.abuseType]}
                  </Text>
                </View>
              </View>
              {result.adminNote ? (
                <View style={[styles.noteBox, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
                  <Feather name="message-square" size={14} color="#15803d" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.infoLabel, { color: "#15803d" }]}>
                      Message des autorités
                    </Text>
                    <Text style={[styles.infoValue, { color: "#166534" }]}>{result.adminNote}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.resetBtn2, { borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Feather name="arrow-left" size={14} color={colors.mutedForeground} />
              <Text style={[styles.resetText2, { color: colors.mutedForeground }]}>
                Rechercher un autre code
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comment obtenir le code */}
        {!searched && (
          <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.howTitle, { color: colors.primary }]}>Comment obtenir mon code ?</Text>
            <Text style={[styles.howText, { color: colors.mutedForeground }]}>
              Votre code de suivi à 8 caractères (format XXXX-XXXX) vous est donné automatiquement après avoir soumis un signalement. Conservez-le précieusement — il est votre seul moyen de suivre l'avancement de votre dossier.
            </Text>
            <View style={[styles.exampleCode, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.exampleText, { color: colors.primary }]}>Exemple : KBJM-4R8Z</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  headerCard: { borderRadius: 16, padding: 20, alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff", textAlign: "center" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 18 },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  infoText: { fontSize: 13, lineHeight: 18, flex: 1, fontWeight: "500" },
  searchCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  searchLabel: { fontSize: 14, fontWeight: "700" },
  searchRow: { flexDirection: "row", gap: 10 },
  searchInput: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: "700", letterSpacing: 1 },
  searchBtn: { width: 48, height: 48, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  notFound: { borderRadius: 14, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
  notFoundTitle: { fontSize: 17, fontWeight: "700" },
  notFoundText: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  resetBtn: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  resetText: { fontSize: 14, fontWeight: "700" },
  resultBlock: { gap: 12 },

  /* Progress card */
  progressCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 16 },
  progressTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },

  /* Barre horizontale */
  progressBarWrap: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
  progressStepWrap: { alignItems: "center", width: 80, gap: 8 },
  progressDot: { alignItems: "center", justifyContent: "center", borderWidth: 2.5 },
  dotInner: { width: 8, height: 8, borderRadius: 4 },
  progressStepLabel: { fontSize: 11, textAlign: "center", lineHeight: 14 },
  progressLine: { flex: 1, height: 3, borderRadius: 2, marginTop: 16 },

  /* Bannière étape active */
  activeStepBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  activeStepLabel: { fontSize: 14, fontWeight: "700" },
  activeStepSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },

  /* Bouton actualiser */
  refreshBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  refreshText: { fontSize: 13, fontWeight: "600" },

  /* Info card */
  infoCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoLabel: { fontSize: 11, fontWeight: "500", marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  noteBox: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },

  resetBtn2: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  resetText2: { fontSize: 14, fontWeight: "600" },
  howCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  howTitle: { fontSize: 14, fontWeight: "700" },
  howText: { fontSize: 13, lineHeight: 19 },
  exampleCode: { borderRadius: 8, padding: 10, alignItems: "center" },
  exampleText: { fontSize: 16, fontWeight: "800", letterSpacing: 2 },
});
