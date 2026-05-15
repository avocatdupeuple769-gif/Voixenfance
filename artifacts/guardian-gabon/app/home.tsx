import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import {
  Linking,
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

const ROSE = "#C2185B";
const BLUE = "#1976D2";
const GREEN = "#388E3C";
const ASSO_PHONE = "+241 04 61 18 38";

const ABUSE_TYPES = [
  { key: "sexual",        label: "Abus Sexuel",                icon: "alert-circle" as const, color: ROSE },
  { key: "inceste",       label: "Inceste",                    icon: "users" as const,        color: "#7B1FA2" },
  { key: "attouchements", label: "Attouchements & Intimidations", icon: "user-x" as const,   color: BLUE },
  { key: "disparition",   label: "Disparition d'enfant",       icon: "search" as const,       color: "#00838F" },
  { key: "violence",      label: "Violence sur mineur",        icon: "zap" as const,          color: "#E65100" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { adminLogin } = useApp();
  const isWeb = Platform.OS === "web";
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 28000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

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

  const handleCallAsso = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS !== "web") {
      Linking.openURL(`tel:${ASSO_PHONE.replace(/\s/g, "")}`);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header sobre */}
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 10 }]}>
        <EmergencyBanner />

        <View style={styles.heroRow}>
          <TouchableOpacity onPress={handleSecretTap} activeOpacity={1}>
            <View style={styles.logoWrap}>
              <Animated.View style={rotateStyle}>
                <Image
                  source={require("../assets/images/logo.jpg")}
                  style={styles.logoImg}
                  contentFit="contain"
                />
              </Animated.View>
            </View>
          </TouchableOpacity>

          <View style={styles.heroText}>
            <Text style={styles.nameFull}>
              <Text style={styles.nameRose}>Les Ailes</Text>
              <Text style={styles.nameRose}>{"  "}</Text>
              <Text style={styles.nameBlue}>de Bride</Text>
            </Text>
            <Text style={styles.tagline}>Protection de l'enfance au Gabon</Text>
          </View>

          <View style={styles.gabonFlag}>
            <View style={[styles.flagBand, { backgroundColor: "#009e60" }]} />
            <View style={[styles.flagBand, { backgroundColor: "#FCD116" }]} />
            <View style={[styles.flagBand, { backgroundColor: "#3A75C4" }]} />
          </View>
        </View>

        <View style={styles.badge}>
          <Feather name="lock" size={11} color={GREEN} />
          <Text style={[styles.badgeText, { color: GREEN }]}>Signalement anonyme & confidentiel</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appel association */}
        <TouchableOpacity style={styles.assoCard} onPress={handleCallAsso} activeOpacity={0.85}>
          <View style={[styles.assoIcon, { backgroundColor: ROSE + "18" }]}>
            <Feather name="phone" size={20} color={ROSE} />
          </View>
          <View style={styles.assoText}>
            <Text style={[styles.assoTitle, { color: ROSE }]}>Association Les Ailes de Bride</Text>
            <Text style={[styles.assoNumber, { color: "#1a1a2e" }]}>{ASSO_PHONE}</Text>
          </View>
          <Feather name="phone-call" size={18} color={ROSE} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Que souhaitez-vous faire ?
        </Text>

        {/* Signalement principal */}
        <TouchableOpacity
          style={[styles.mainCard, { backgroundColor: ROSE }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/report");
          }}
          activeOpacity={0.88}
        >
          <View style={[styles.mainIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="alert-triangle" size={24} color="#ffffff" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.mainTitle}>Signaler un abus</Text>
            <Text style={styles.mainSub}>Anonyme et confidentiel</Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* Types d'abus */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Types d'abus à signaler
        </Text>
        {ABUSE_TYPES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.row, styles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { Haptics.selectionAsync(); router.push("/report"); }}
            activeOpacity={0.8}
          >
            <View style={[styles.typeIcon, { backgroundColor: item.color + "15" }]}>
              <Feather name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={[styles.typeLabel, { color: colors.foreground, flex: 1 }]}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}

        {/* Ressources */}
        <TouchableOpacity
          style={[styles.row, styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { Haptics.selectionAsync(); router.push("/resources"); }}
          activeOpacity={0.8}
        >
          <View style={[styles.navIcon, { backgroundColor: GREEN + "15" }]}>
            <Feather name="life-buoy" size={20} color={GREEN} />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.navTitle, { color: colors.foreground }]}>Ressources & Aide</Text>
            <Text style={[styles.navSub, { color: colors.mutedForeground }]}>ONG, numéros d'urgence, soutien</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Code pénal */}
        <TouchableOpacity
          style={[styles.row, styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { Haptics.selectionAsync(); router.push("/penal-code"); }}
          activeOpacity={0.8}
        >
          <View style={[styles.navIcon, { backgroundColor: BLUE + "15" }]}>
            <Feather name="book-open" size={20} color={BLUE} />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.navTitle, { color: colors.foreground }]}>Code Pénal Gabonais</Text>
            <Text style={[styles.navSub, { color: colors.mutedForeground }]}>Articles protégeant les mineurs</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Admin discret */}
        <TouchableOpacity
          style={[styles.row, styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { Haptics.selectionAsync(); router.push("/admin-login"); }}
          activeOpacity={0.8}
        >
          <View style={[styles.navIcon, { backgroundColor: colors.muted }]}>
            <Feather name="settings" size={20} color={colors.mutedForeground} />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.navTitle, { color: colors.foreground }]}>Espace Administrateur</Text>
            <Text style={[styles.navSub, { color: colors.mutedForeground }]}>Accès réservé — connexion requise</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Feather name="info" size={14} color={BLUE} />
            <Text style={[styles.infoTitle, { color: BLUE }]}>Comment ça fonctionne ?</Text>
          </View>
          {[
            { icon: "user-x" as const, text: "Signalez anonymement — votre identité est cachée du public" },
            { icon: "camera" as const, text: "Joignez des photos ou vidéos comme preuves" },
            { icon: "lock" as const, text: "Seul l'administrateur voit les détails du dossier" },
            { icon: "life-buoy" as const, text: "Accédez aux ressources d'aide et de soutien" },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Feather name={item.icon} size={12} color={BLUE} />
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
  flex1: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center" },

  /* Header */
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#dde2eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  logoWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#dde2eb",
  },
  logoImg: { width: 50, height: 50 },
  heroText: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "baseline" },
  nameFull: { fontSize: 19, fontWeight: "800", letterSpacing: -0.4 },
  nameRose: { fontSize: 19, fontWeight: "800", color: ROSE, letterSpacing: -0.4 },
  nameBlue: { fontSize: 19, fontWeight: "800", color: BLUE, letterSpacing: -0.4 },
  tagline: { fontSize: 11, color: "#6b7280", marginTop: 1 },

  gabonFlag: { width: 28, height: 18, borderRadius: 3, overflow: "hidden" },
  flagBand: { flex: 1 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#388E3C10",
    borderWidth: 1,
    borderColor: "#388E3C30",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  /* Scroll */
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },

  /* Association */
  assoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: ROSE + "30",
    borderRadius: 14,
    padding: 14,
    shadowColor: ROSE,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  assoIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  assoText: { flex: 1 },
  assoTitle: { fontSize: 12, fontWeight: "600" },
  assoNumber: { fontSize: 16, fontWeight: "800", marginTop: 1 },

  /* Main card */
  mainCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    shadowColor: ROSE,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  mainIcon: { width: 48, height: 48, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  mainTitle: { fontSize: 16, fontWeight: "800", color: "#ffffff" },
  mainSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },

  /* Type cards */
  typeCard: {
    gap: 12,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  typeLabel: { fontSize: 14, fontWeight: "600" },

  /* Nav cards */
  navCard: {
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  navIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "700" },
  navSub: { fontSize: 12, marginTop: 2 },

  /* Info */
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginTop: 2,
  },
  infoTitle: { fontSize: 13, fontWeight: "700", marginLeft: 6 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  infoText: { fontSize: 12, lineHeight: 17, flex: 1 },
});
