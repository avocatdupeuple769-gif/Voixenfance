import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { useColors } from "@/hooks/useColors";

export default function ReportSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  const handleHome = () => {
    Haptics.selectionAsync();
    router.replace("/home");
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Icône succès animée */}
      <View style={styles.successIconWrap}>
        <LinearGradient
          colors={["#f0fdf4", "#dcfce7"]}
          style={styles.successOuterCircle}
        >
          <View style={styles.successCircle}>
            <Feather name="check" size={44} color="#ffffff" />
          </View>
        </LinearGradient>
      </View>

      <Text style={[styles.title, { color: "#16a34a" }]}>Signalement envoyé !</Text>

      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Votre signalement a été transmis de manière totalement confidentielle. L'administrateur en a été informé et prendra les mesures nécessaires.
      </Text>

      {/* Carte de confirmation */}
      <LinearGradient
        colors={["#0d2146", "#1a3a6b"]}
        style={styles.confirmCard}
      >
        <View style={styles.confirmRow}>
          <View style={styles.confirmIconWrap}>
            <Feather name="lock" size={20} color="#c9a227" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.confirmTitle}>Signalement enregistré</Text>
            <Text style={styles.confirmSub}>Votre identité est protégée</Text>
          </View>
          <Feather name="check-circle" size={22} color="#4ade80" />
        </View>

        <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />

        {[
          { icon: "shield" as const, text: "Vos données sont chiffrées et sécurisées" },
          { icon: "user-x" as const, text: "Votre nom n'est pas visible publiquement" },
          { icon: "eye-off" as const, text: "Seul l'administrateur peut voir les détails" },
        ].map((item, i) => (
          <View key={i} style={styles.confirmItem}>
            <View style={styles.confirmItemIcon}>
              <Feather name={item.icon} size={13} color="#c9a227" />
            </View>
            <Text style={styles.confirmItemText}>{item.text}</Text>
          </View>
        ))}
      </LinearGradient>

      {/* Prochaines étapes */}
      <View style={[styles.stepsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.stepsTitle, { color: colors.primary }]}>Que se passe-t-il maintenant ?</Text>
        {[
          { num: "1", text: "L'administrateur reçoit votre signalement" },
          { num: "2", text: "Il examine les informations et preuves fournies" },
          { num: "3", text: "Les autorités compétentes sont contactées si nécessaire" },
        ].map((step) => (
          <View key={step.num} style={styles.stepRow}>
            <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumText}>{step.num}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.foreground }]}>{step.text}</Text>
          </View>
        ))}
      </View>

      {/* Message de soutien */}
      <View style={[styles.thanksBox, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
        <Feather name="heart" size={16} color="#dc2626" />
        <Text style={[styles.thanksText, { color: "#991b1b" }]}>
          Merci pour votre courage. Chaque signalement contribue à protéger les enfants du Gabon.
        </Text>
      </View>

      {/* Retour accueil */}
      <TouchableOpacity
        style={[styles.homeBtn, { backgroundColor: colors.primary }]}
        onPress={handleHome}
        activeOpacity={0.85}
      >
        <Feather name="home" size={18} color="#ffffff" />
        <Text style={styles.homeBtnText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 22,
    paddingTop: 52,
    alignItems: "center",
    gap: 18,
  },
  successIconWrap: { marginBottom: 4 },
  successOuterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  confirmCard: {
    width: "100%",
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confirmIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  confirmSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  divider: { height: 1, width: "100%" },
  confirmItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  confirmItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(201,162,39,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmItemText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    flex: 1,
  },
  stepsCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  stepText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    paddingTop: 4,
  },
  thanksBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  thanksText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  homeBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  homeBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
