import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomPadding = isWeb ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <EmergencyBanner />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App identity */}
        <View style={styles.heroRow}>
          <View style={[styles.shieldIcon, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={30} color={colors.primaryForeground} />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.appName, { color: colors.primary }]}>VoixEnfance</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              La voix des enfants du Gabon
            </Text>
          </View>
        </View>

        {/* Confidentiality note */}
        <View style={[styles.alertBox, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
          <Feather name="lock" size={15} color="#dc2626" />
          <Text style={[styles.alertText, { color: "#991b1b" }]}>
            Toutes les informations restent strictement confidentielles. Votre signalement est
            anonyme et protégé.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Que souhaitez-vous faire ?
        </Text>

        {/* Primary action */}
        <TouchableOpacity
          style={[styles.mainAction, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/report");
          }}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="alert-triangle" size={24} color="#ffffff" />
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={styles.actionTitleWhite}>Signaler un abus</Text>
            <Text style={styles.actionSubWhite}>Signalement anonyme et confidentiel</Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Secondary actions */}
        <View style={styles.twoColumns}>
          <TouchableOpacity
            style={[styles.halfCard, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}
            onPress={() => { Haptics.selectionAsync(); router.push("/track-report"); }}
            activeOpacity={0.8}
          >
            <View style={[styles.halfIcon, { backgroundColor: "#fee2e2" }]}>
              <Feather name="search" size={20} color="#dc2626" />
            </View>
            <Text style={[styles.halfTitle, { color: "#991b1b" }]}>Suivre mon dossier</Text>
            <Text style={[styles.halfSub, { color: "#b91c1c" }]}>Avec votre code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.halfCard, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}
            onPress={() => { Haptics.selectionAsync(); router.push("/resources"); }}
            activeOpacity={0.8}
          >
            <View style={[styles.halfIcon, { backgroundColor: "#dcfce7" }]}>
              <Feather name="life-buoy" size={20} color="#15803d" />
            </View>
            <Text style={[styles.halfTitle, { color: "#14532d" }]}>Ressources</Text>
            <Text style={[styles.halfSub, { color: "#166534" }]}>ONG & soutien</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.twoColumns}>
          <TouchableOpacity
            style={[styles.halfCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { Haptics.selectionAsync(); router.push("/penal-code"); }}
            activeOpacity={0.8}
          >
            <View style={[styles.halfIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="book-open" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.halfTitle, { color: colors.foreground }]}>Code pénal</Text>
            <Text style={[styles.halfSub, { color: colors.mutedForeground }]}>Articles mineurs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.halfCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { Haptics.selectionAsync(); router.push("/admin-login"); }}
            activeOpacity={0.8}
          >
            <View style={[styles.halfIcon, { backgroundColor: "#f9fafb" }]}>
              <Feather name="settings" size={20} color="#374151" />
            </View>
            <Text style={[styles.halfTitle, { color: colors.foreground }]}>Administrateur</Text>
            <Text style={[styles.halfSub, { color: colors.mutedForeground }]}>Accès réservé</Text>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>Comment ça fonctionne ?</Text>
          {[
            { icon: "user-x" as const, text: "Signalez anonymement — votre identité est cachée du public" },
            { icon: "hash" as const, text: "Recevez un code de suivi pour suivre votre dossier" },
            { icon: "lock" as const, text: "Seul l'administrateur voit les détails confidentiels" },
            { icon: "life-buoy" as const, text: "Accédez aux ressources d'aide et de soutien" },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon} size={14} color={colors.primary} />
              </View>
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 2,
  },
  shieldIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { flex: 1 },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    marginTop: 2,
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  mainAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 16,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextBlock: { flex: 1 },
  actionTitleWhite: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionSubWhite: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  twoColumns: {
    flexDirection: "row",
    gap: 10,
  },
  halfCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  halfIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  halfTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  halfSub: {
    fontSize: 11,
    fontWeight: "500",
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
