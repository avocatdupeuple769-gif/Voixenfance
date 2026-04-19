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
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { adminLogin } = useApp();
  const isWeb = Platform.OS === "web";
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const tapCountRef = React.useRef(0);
  const tapTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 10) {
      tapCountRef.current = 0;
      adminLogin("__tap_unlock__");
      router.push("/admin-dashboard");
    } else {
      tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 2000);
    }
  };

  return (
    <View style={styles.root}>
      {/* Header dégradé */}
      <LinearGradient
        colors={["#0d2146", "#1a3a6b", "#1e4d8c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 16 }]}
      >
        {/* Décorations */}
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
        <View style={styles.decAccent} />

        <EmergencyBanner />

        {/* Identity */}
        <View style={styles.heroRow}>
          <TouchableOpacity onPress={handleSecretTap} activeOpacity={1}>
            <View style={styles.shieldWrap}>
              <Feather name="shield" size={28} color="#c9a227" />
            </View>
          </TouchableOpacity>
          <View style={styles.heroText}>
            <View style={styles.nameRow}>
              <Text style={styles.appNameWhite}>Voix</Text>
              <Text style={styles.appNameGold}>Enfance</Text>
            </View>
            <Text style={styles.tagline}>La voix des enfants du Gabon</Text>
          </View>
          <View style={styles.gabonFlag}>
            <View style={[styles.flagBand, { backgroundColor: "#009e60" }]} />
            <View style={[styles.flagBand, { backgroundColor: "#FCD116" }]} />
            <View style={[styles.flagBand, { backgroundColor: "#3A75C4" }]} />
          </View>
        </View>

        {/* Confidentiality badge */}
        <View style={styles.heroBadge}>
          <Feather name="lock" size={12} color="#c9a227" />
          <Text style={styles.heroBadgeText}>Signalement anonyme & confidentiel</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Que souhaitez-vous faire ?
        </Text>

        {/* Action principale */}
        <TouchableOpacity
          style={styles.mainAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/report");
          }}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={["#dc2626", "#b91c1c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainActionGradient}
          >
            <View style={styles.mainActionIcon}>
              <Feather name="alert-triangle" size={26} color="#ffffff" />
            </View>
            <View style={styles.actionTextBlock}>
              <Text style={styles.mainActionTitle}>Signaler un abus</Text>
              <Text style={styles.mainActionSub}>Signalement anonyme et confidentiel</Text>
            </View>
            <View style={styles.arrowWrap}>
              <Feather name="chevron-right" size={22} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Ressources */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#f0fdf4", borderColor: "#86efac" }]}
          onPress={() => { Haptics.selectionAsync(); router.push("/resources"); }}
          activeOpacity={0.8}
        >
          <View style={[styles.cardIcon, { backgroundColor: "#dcfce7" }]}>
            <Feather name="life-buoy" size={22} color="#16a34a" />
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={[styles.cardTitle, { color: "#14532d" }]}>Ressources & Aide</Text>
            <Text style={[styles.cardSub, { color: "#166534" }]}>ONG, numéros d'urgence, soutien</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#16a34a" />
        </TouchableOpacity>

        {/* Code pénal */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}
          onPress={() => { Haptics.selectionAsync(); router.push("/penal-code"); }}
          activeOpacity={0.8}
        >
          <View style={[styles.cardIcon, { backgroundColor: "#dbeafe" }]}>
            <Feather name="book-open" size={22} color="#1d4ed8" />
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={[styles.cardTitle, { color: "#1e3a8a" }]}>Code Pénal Gabonais</Text>
            <Text style={[styles.cardSub, { color: "#1e40af" }]}>Articles protégeant les mineurs</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#1d4ed8" />
        </TouchableOpacity>

        {/* Admin (discret) */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { Haptics.selectionAsync(); router.push("/admin-login"); }}
          activeOpacity={0.8}
        >
          <View style={[styles.cardIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="settings" size={22} color={colors.mutedForeground} />
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Espace Administrateur</Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Accès réservé — connexion requise</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Comment ça fonctionne */}
        <View style={[styles.infoCard, { backgroundColor: "#0d2146", borderColor: "rgba(201,162,39,0.3)" }]}>
          <View style={styles.infoHeader}>
            <Feather name="shield" size={16} color="#c9a227" />
            <Text style={styles.infoTitle}>Comment ça fonctionne ?</Text>
          </View>
          {[
            { icon: "user-x" as const, text: "Signalez anonymement — votre identité est cachée du public" },
            { icon: "camera" as const, text: "Joignez des photos ou vidéos comme preuves" },
            { icon: "lock" as const, text: "Seul l'administrateur voit les détails du dossier" },
            { icon: "life-buoy" as const, text: "Accédez aux ressources d'aide et de soutien" },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Feather name={item.icon} size={13} color="#c9a227" />
              </View>
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },

  /* Header */
  header: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    gap: 14,
    overflow: "hidden",
  },
  decCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(201,162,39,0.07)",
    top: -60,
    right: -60,
  },
  decCircle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -40,
    left: -20,
  },
  decAccent: {
    position: "absolute",
    width: 3,
    height: "100%",
    backgroundColor: "#c9a227",
    right: 50,
    opacity: 0.15,
  },

  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shieldWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(201,162,39,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  appNameWhite: { fontSize: 22, fontWeight: "800", color: "#ffffff", letterSpacing: -0.5 },
  appNameGold: { fontSize: 22, fontWeight: "800", color: "#c9a227", letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },

  gabonFlag: {
    width: 30,
    height: 20,
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "column",
  },
  flagBand: { flex: 1 },

  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  heroBadgeText: { color: "#c9a227", fontSize: 11, fontWeight: "600" },

  /* Content */
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },

  /* Main action */
  mainAction: {
    borderRadius: 18,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#dc2626",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  mainActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
  },
  mainActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainActionTitle: { fontSize: 17, fontWeight: "800", color: "#ffffff" },
  mainActionSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  arrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Action cards */
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionTextBlock: { flex: 1 },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardSub: { fontSize: 12, marginTop: 2 },

  /* Info card */
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginTop: 4,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  infoTitle: { fontSize: 13, fontWeight: "700", color: "#c9a227" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "rgba(201,162,39,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoText: { fontSize: 13, lineHeight: 18, flex: 1, color: "rgba(255,255,255,0.75)" },
});
