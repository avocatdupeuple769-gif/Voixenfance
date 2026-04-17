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
        <View style={styles.heroRow}>
          <View style={[styles.shieldIcon, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={32} color={colors.primaryForeground} />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.appName, { color: colors.primary }]}>GuardianGabon</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              Protéger les enfants, ensemble
            </Text>
          </View>
        </View>

        <View style={[styles.alertBox, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
          <Feather name="lock" size={16} color="#dc2626" />
          <Text style={[styles.alertText, { color: "#991b1b" }]}>
            Toutes les informations restent strictement confidentielles. Votre signalement est
            anonyme et protégé.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Que souhaitez-vous faire ?
        </Text>

        <TouchableOpacity
          style={[styles.mainAction, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/report");
          }}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="alert-triangle" size={26} color="#ffffff" />
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={styles.actionTitle}>Signaler un abus</Text>
            <Text style={styles.actionSubtitle}>Signalement anonyme et confidentiel</Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/penal-code");
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="book-open" size={22} color={colors.primary} />
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={[styles.actionTitleDark, { color: colors.foreground }]}>
              Code pénal gabonais
            </Text>
            <Text style={[styles.actionSubtitleDark, { color: colors.mutedForeground }]}>
              Articles sur la protection des mineurs
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/admin-login");
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#f0fdf4" }]}>
            <Feather name="settings" size={22} color="#16a34a" />
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={[styles.actionTitleDark, { color: colors.foreground }]}>
              Espace administrateur
            </Text>
            <Text style={[styles.actionSubtitleDark, { color: colors.mutedForeground }]}>
              Accès réservé aux autorités
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>
            Comment fonctionne l'application ?
          </Text>
          {[
            {
              icon: "user-x" as const,
              text: "Vous signalez anonymement — votre identité est cachée du public",
            },
            {
              icon: "lock" as const,
              text: "Seul l'administrateur voit les détails du signalement",
            },
            {
              icon: "shield" as const,
              text: "Toutes les données sont chiffrées et sécurisées",
            },
            {
              icon: "phone" as const,
              text: "Les autorités peuvent être contactées directement en urgence",
            },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon} size={14} color={colors.primary} />
              </View>
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {item.text}
              </Text>
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
    marginBottom: 4,
  },
  shieldIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { flex: 1 },
  appName: {
    fontSize: 24,
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
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
  },
  mainAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 16,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextBlock: { flex: 1 },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionTitleDark: {
    fontSize: 15,
    fontWeight: "700",
  },
  actionSubtitleDark: {
    fontSize: 12,
    marginTop: 2,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
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
