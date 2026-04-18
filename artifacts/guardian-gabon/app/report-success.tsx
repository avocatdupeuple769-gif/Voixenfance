import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
  const { code } = useLocalSearchParams<{ code: string }>();
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (code) {
      await Clipboard.setStringAsync(code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTrack = () => {
    Haptics.selectionAsync();
    router.replace({ pathname: "/track-report", params: { code } });
  };

  const handleHome = () => {
    router.replace("/home");
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Icône succès */}
      <View style={[styles.successIcon, { backgroundColor: "#f0fdf4" }]}>
        <View style={[styles.successCircle, { backgroundColor: "#16a34a" }]}>
          <Feather name="check" size={40} color="#ffffff" />
        </View>
      </View>

      <Text style={[styles.title, { color: "#16a34a" }]}>Signalement envoyé !</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Votre signalement a été transmis de manière totalement confidentielle aux autorités compétentes.
      </Text>

      {/* Code de suivi mis en évidence */}
      <View style={[styles.codeCard, { backgroundColor: colors.primary }]}>
        <View style={styles.codeHeader}>
          <Feather name="key" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.codeLabel}>Votre code de suivi</Text>
        </View>

        <Text style={styles.codeValue}>{code}</Text>

        <Text style={styles.codeNote}>
          Conservez ce code — c'est votre seul moyen de suivre votre dossier
        </Text>

        <TouchableOpacity
          style={[styles.copyBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
          onPress={handleCopy}
          activeOpacity={0.8}
        >
          <Feather name={copied ? "check" : "copy"} size={16} color="#ffffff" />
          <Text style={styles.copyText}>
            {copied ? "Code copié !" : "Copier le code"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Avertissement */}
      <View style={[styles.warningBox, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
        <Feather name="alert-circle" size={16} color="#d97706" />
        <Text style={[styles.warningText, { color: "#92400e" }]}>
          Ce code ne peut pas être récupéré si vous le perdez. Notez-le ou copiez-le maintenant.
        </Text>
      </View>

      {/* Bouton suivi */}
      <TouchableOpacity
        style={[styles.trackBtn, { backgroundColor: colors.primary }]}
        onPress={handleTrack}
        activeOpacity={0.85}
      >
        <Feather name="search" size={18} color="#ffffff" />
        <Text style={styles.trackBtnText}>Suivre mon dossier maintenant</Text>
      </TouchableOpacity>

      {/* Retour accueil */}
      <TouchableOpacity
        style={[styles.homeBtn, { borderColor: colors.border }]}
        onPress={handleHome}
        activeOpacity={0.8}
      >
        <Feather name="home" size={16} color={colors.mutedForeground} />
        <Text style={[styles.homeBtnText, { color: colors.mutedForeground }]}>
          Retour à l'accueil
        </Text>
      </TouchableOpacity>

      {/* Info merci */}
      <View style={[styles.thanksBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="heart" size={14} color="#dc2626" />
        <Text style={[styles.thanksText, { color: colors.mutedForeground }]}>
          Merci pour votre courage. Chaque signalement contribue à protéger les enfants du Gabon.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: "center",
    gap: 16,
  },
  successIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  codeCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  codeLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  codeValue: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 4,
    textAlign: "center",
  },
  codeNote: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  copyText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  warningBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  trackBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  trackBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  homeBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  thanksBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  thanksText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
