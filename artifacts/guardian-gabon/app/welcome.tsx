import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ROSE = "#C2185B";
const BLUE = "#1976D2";
const GREEN = "#388E3C";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1600 }),
        withTiming(1, { duration: 1600 })
      ),
      -1,
      false
    );
    rotation.value = withRepeat(
      withTiming(360, { duration: 28000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.15,
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/home");
  };

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      {/* Décoration fond */}
      <Animated.View style={[styles.bgBlob1, pulseStyle]} />
      <View style={styles.bgBlob2} />

      <View style={[styles.content, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}>

        {/* Badge pays */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.topBadge}>
          <View style={[styles.dot, { backgroundColor: GREEN }]} />
          <Text style={[styles.badgeText, { color: GREEN }]}>GABON — Protection de l'Enfance</Text>
        </Animated.View>

        {/* Logo */}
        <Animated.View entering={FadeIn.delay(200).duration(700)} style={styles.logoWrap}>
          <Animated.View style={rotateStyle}>
            <Image
              source={require("../assets/images/logo.jpg")}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
        </Animated.View>

        {/* Nom */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.nameBlock}>
          <Text style={[styles.namePart, { color: ROSE }]}>Les Ailes </Text>
          <Text style={[styles.namePart, { color: BLUE }]}>de Bride</Text>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(500).duration(500)} style={styles.tagline}>
          La protection des enfants du Gabon
        </Animated.Text>

        {/* Séparateur */}
        <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: ROSE, opacity: 0.2 }]} />
          <Feather name="heart" size={12} color={ROSE} />
          <View style={[styles.dividerLine, { backgroundColor: BLUE, opacity: 0.2 }]} />
        </Animated.View>

        {/* Fonctionnalités */}
        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.featuresBlock}>
          {[
            { icon: "user-x" as const, text: "Signalez anonymement — votre identité est protégée", color: ROSE },
            { icon: "camera" as const, text: "Joignez des photos ou vidéos comme preuves", color: BLUE },
            { icon: "phone-call" as const, text: "Numéros d'urgence disponibles 24h/24", color: ROSE },
            { icon: "life-buoy" as const, text: "Ressources d'aide : ONG, soutien psychologique", color: BLUE },
          ].map((item, i) => (
            <View key={i} style={styles.featRow}>
              <View style={[styles.featIcon, { backgroundColor: item.color + "15" }]}>
                <Feather name={item.icon} size={14} color={item.color} />
              </View>
              <Text style={styles.featText}>{item.text}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.spacer} />

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(900).duration(500)} style={styles.ctaBlock}>
          <TouchableOpacity style={[styles.ctaButton, { backgroundColor: ROSE }]} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Accéder à l'application</Text>
            <Feather name="arrow-right" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.legal}>Toutes vos données sont confidentielles et sécurisées</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6f9" },

  bgBlob1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#C2185B",
  },
  bgBlob2: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#1976D2",
    opacity: 0.08,
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
  },

  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#388E3C18",
    borderWidth: 1,
    borderColor: "#388E3C40",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },

  logoWrap: {
    marginTop: 28,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1976D2",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  logo: { width: 140, height: 140, borderRadius: 70 },

  nameBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 22,
    gap: 0,
  },
  namePart: { fontSize: 32, fontWeight: "800", letterSpacing: -0.8 },

  tagline: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.1,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    width: "100%",
  },
  dividerLine: { flex: 1, height: 1 },

  featuresBlock: {
    marginTop: 18,
    width: "100%",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dde2eb",
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  featText: { color: "#374151", fontSize: 13, flex: 1, lineHeight: 18 },

  spacer: { flex: 1 },

  ctaBlock: { width: "100%", gap: 12, alignItems: "center" },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#C2185B",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: { fontSize: 16, fontWeight: "800", color: "#ffffff", letterSpacing: 0.2 },
  legal: { fontSize: 11, color: "#9ca3af", textAlign: "center" },
});
