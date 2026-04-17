import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
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

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const glow = useSharedValue(0.85);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0.85, { duration: 1800 })
      ),
      -1,
      false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: glow.value }],
  }));

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/home");
  };

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0d2146" }]} />
      <View style={[styles.gradientOverlay, { backgroundColor: "#1a3a6b" }]} />
      <View style={styles.goldAccent} />
      <View style={styles.goldAccentBottom} />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <View style={[styles.content, { paddingTop: topPad + 20, paddingBottom: bottomPad + 20 }]}>
        {/* Badge */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.topBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>GABON — Protection de l'Enfance</Text>
        </Animated.View>

        {/* Logo */}
        <View style={styles.logoSection}>
          <Animated.View style={[styles.glowRing, glowStyle]} />
          <Animated.View entering={FadeIn.delay(300).duration(800)} style={styles.logoContainer}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
        </View>

        {/* Name */}
        <Animated.View entering={FadeInUp.delay(500).duration(700)} style={styles.nameBlock}>
          <Text style={styles.appName}>Voix</Text>
          <Text style={styles.appNameGold}>Enfance</Text>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(630).duration(600)} style={styles.tagline}>
          La voix des enfants du Gabon
        </Animated.Text>

        {/* Divider */}
        <Animated.View entering={FadeIn.delay(700).duration(600)} style={styles.divider}>
          <View style={styles.dividerLine} />
          <Feather name="shield" size={13} color="#c9a227" />
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInUp.delay(800).duration(600)} style={styles.descBlock}>
          {[
            { icon: "user-x" as const, text: "Signalez anonymement — votre identité est protégée" },
            { icon: "search" as const, text: "Suivez votre dossier avec un code confidentiel" },
            { icon: "phone-call" as const, text: "Numéros d'urgence disponibles 24h/24" },
            { icon: "life-buoy" as const, text: "Ressources d'aide : ONG, soutien psychologique" },
          ].map((item, i) => (
            <View key={i} style={styles.descRow}>
              <View style={styles.descIconWrap}>
                <Feather name={item.icon} size={14} color="#c9a227" />
              </View>
              <Text style={styles.descText}>{item.text}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.spacer} />

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(1000).duration(600)} style={styles.ctaBlock}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Accéder à l'application</Text>
            <Feather name="arrow-right" size={20} color="#0d2146" />
          </TouchableOpacity>
          <Text style={styles.legalNote}>
            Toutes vos données sont confidentielles et sécurisées
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d2146" },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    opacity: 0.6,
  },
  goldAccent: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#c9a227",
    opacity: 0.08,
  },
  goldAccentBottom: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#c9a227",
    opacity: 0.06,
  },
  circle: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.12)",
  },
  circle1: {
    width: 320,
    height: 320,
    borderRadius: 160,
    top: height * 0.18,
    left: width / 2 - 160,
  },
  circle2: {
    width: 450,
    height: 450,
    borderRadius: 225,
    top: height * 0.14,
    left: width / 2 - 225,
  },
  circle3: {
    width: 580,
    height: 580,
    borderRadius: 290,
    top: height * 0.1,
    left: width / 2 - 290,
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
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.3)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#c9a227",
  },
  badgeText: {
    color: "#c9a227",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  logoSection: {
    marginTop: 26,
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(201,162,39,0.18)",
  },
  logoContainer: {
    width: 116,
    height: 116,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(201,162,39,0.4)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: 98,
    height: 98,
  },
  nameBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 20,
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -1,
  },
  appNameGold: {
    fontSize: 38,
    fontWeight: "800",
    color: "#c9a227",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 5,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,162,39,0.4)",
  },
  descBlock: {
    marginTop: 20,
    width: "100%",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 18,
  },
  descRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  descIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(201,162,39,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  descText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  spacer: { flex: 1 },
  ctaBlock: {
    width: "100%",
    gap: 14,
    alignItems: "center",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    backgroundColor: "#c9a227",
    paddingVertical: 17,
    borderRadius: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0d2146",
    letterSpacing: 0.2,
  },
  legalNote: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
});
