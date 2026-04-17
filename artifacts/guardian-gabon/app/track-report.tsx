import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
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

const STATUS_CONFIG = {
  pending: {
    label: "En attente de traitement",
    sublabel: "Votre signalement a bien été reçu et sera examiné prochainement.",
    color: "#d97706",
    bg: "#fffbeb",
    icon: "clock" as const,
  },
  reviewed: {
    label: "Dossier en cours de traitement",
    sublabel: "Les autorités compétentes examinent activement votre signalement.",
    color: "#2563eb",
    bg: "#eff6ff",
    icon: "eye" as const,
  },
  closed: {
    label: "Dossier traité",
    sublabel: "Votre signalement a été traité. Merci pour votre contribution.",
    color: "#16a34a",
    bg: "#f0fdf4",
    icon: "check-circle" as const,
  },
};

const ABUSE_LABELS = {
  sexual: "Abus sexuel",
  violence: "Violence",
  both: "Abus sexuel & Violence",
};

export default function TrackReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getReportByCode } = useApp();
  const isWeb = Platform.OS === "web";

  const [code, setCode] = useState("");
  const [result, setResult] = useState<Report | null | "not_found">(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!code.trim()) return;
    Haptics.selectionAsync();
    const report = getReportByCode(code.trim());
    if (report) {
      setResult(report);
    } else {
      setResult("not_found");
    }
    setSearched(true);
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
    setSearched(false);
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
        {/* Header card */}
        <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
          <Feather name="search" size={24} color="#ffffff" />
          <Text style={styles.headerTitle}>Suivi de signalement</Text>
          <Text style={styles.headerSubtitle}>
            Entrez votre code de suivi pour consulter l'état de votre dossier
          </Text>
        </View>

        {/* Info box */}
        <View style={[styles.infoBox, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
          <Feather name="shield" size={14} color="#15803d" />
          <Text style={[styles.infoText, { color: "#166534" }]}>
            Votre code de suivi vous a été fourni après votre signalement. Il vous permet de vérifier l'avancement de votre dossier de façon totalement anonyme.
          </Text>
        </View>

        {/* Search input */}
        <View style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.searchLabel, { color: colors.foreground }]}>
            Code de suivi
          </Text>
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchInput,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}
            >
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
              style={[styles.searchBtn, { backgroundColor: colors.primary }]}
              onPress={handleSearch}
              activeOpacity={0.85}
            >
              <Feather name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        {searched && result === "not_found" && (
          <View style={[styles.notFound, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
            <Feather name="alert-circle" size={32} color="#dc2626" />
            <Text style={[styles.notFoundTitle, { color: "#dc2626" }]}>Code introuvable</Text>
            <Text style={[styles.notFoundText, { color: "#991b1b" }]}>
              Aucun signalement ne correspond à ce code. Vérifiez que vous avez saisi le code correctement (majuscules et tiret inclus).
            </Text>
            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: "#dc2626" }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetText, { color: "#dc2626" }]}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {searched && result && result !== "not_found" && (
          <View style={styles.resultBlock}>
            {/* Status banner */}
            {(() => {
              const s = STATUS_CONFIG[result.status];
              return (
                <View style={[styles.statusBanner, { backgroundColor: s.bg, borderColor: s.color + "40" }]}>
                  <View style={[styles.statusIconWrap, { backgroundColor: s.color + "20" }]}>
                    <Feather name={s.icon} size={26} color={s.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
                    <Text style={[styles.statusSublabel, { color: s.color + "cc" }]}>
                      {s.sublabel}
                    </Text>
                  </View>
                </View>
              );
            })()}

            {/* Timeline */}
            <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.timelineTitle, { color: colors.foreground }]}>Progression du dossier</Text>
              {(["pending", "reviewed", "closed"] as Report["status"][]).map((s, i) => {
                const cfg = STATUS_CONFIG[s];
                const isActive = result.status === s;
                const isPast =
                  (s === "pending") ||
                  (s === "reviewed" && (result.status === "reviewed" || result.status === "closed")) ||
                  (s === "closed" && result.status === "closed");
                const labels = { pending: "Signalement reçu", reviewed: "En cours d'examen", closed: "Dossier clôturé" };
                return (
                  <View key={s} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: isPast ? cfg.color : colors.muted,
                            borderColor: isPast ? cfg.color : colors.border,
                          },
                        ]}
                      >
                        {isPast && <Feather name="check" size={10} color="#fff" />}
                      </View>
                      {i < 2 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: isPast && result.status !== s ? cfg.color : colors.muted },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineStep,
                          { color: isPast ? colors.foreground : colors.mutedForeground, fontWeight: isActive ? "700" : "500" },
                        ]}
                      >
                        {labels[s]}
                      </Text>
                      {isActive && (
                        <Text style={[styles.timelineActive, { color: cfg.color }]}>
                          Statut actuel
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Info */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.infoRow}>
                <Feather name="calendar" size={14} color={colors.mutedForeground} />
                <View>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Date de soumission
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {new Date(result.submittedAt).toLocaleDateString("fr-GA", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Feather name="alert-triangle" size={14} color={colors.mutedForeground} />
                <View>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Type d'abus signalé
                  </Text>
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
                      Note des autorités
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
              <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
              <Text style={[styles.resetText2, { color: colors.mutedForeground }]}>
                Rechercher un autre code
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* How it works */}
        {!searched && (
          <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.howTitle, { color: colors.primary }]}>Comment obtenir mon code ?</Text>
            <Text style={[styles.howText, { color: colors.mutedForeground }]}>
              Votre code de suivi à 8 caractères (format XXXX-XXXX) vous est donné automatiquement après avoir soumis un signalement. Conservez-le précieusement — il est votre seul moyen de suivre l'avancement de votre dossier.
            </Text>
            <View style={[styles.exampleCode, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.exampleText, { color: colors.primary }]}>
                Exemple : KBJM-4R8Z
              </Text>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  headerCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    fontWeight: "500",
  },
  searchCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  notFoundTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  notFoundText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  resetBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  resetText: {
    fontSize: 14,
    fontWeight: "700",
  },
  resultBlock: {
    gap: 12,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  statusSublabel: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  timelineCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 0,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 14,
  },
  timelineLeft: {
    alignItems: "center",
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineStep: {
    fontSize: 14,
  },
  timelineActive: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  noteBox: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  resetBtn2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetText2: {
    fontSize: 14,
    fontWeight: "600",
  },
  howCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  howTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  howText: {
    fontSize: 13,
    lineHeight: 19,
  },
  exampleCode: {
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  exampleText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
});
