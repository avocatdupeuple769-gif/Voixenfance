import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const REQUIRED_TAPS = 10;

export default function AdminLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { adminLogin, isAdmin } = useApp();

  const [tapCount, setTapCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  if (isAdmin) {
    router.replace("/admin-dashboard");
    return null;
  }

  const animateTap = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    animateTap();

    if (newCount < REQUIRED_TAPS) {
      Haptics.selectionAsync();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      adminLogin("__tap_unlock__");
      router.replace("/admin-dashboard");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.content}>

        {/* Logo — taper 10 fois pour accéder (aucun indice visible) */}
        <TouchableOpacity
          onPress={handleLogoTap}
          activeOpacity={0.95}
          style={styles.logoArea}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Image
              source={require("@/assets/images/logo.jpg")}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
        </TouchableOpacity>

        <Text style={[styles.appName, { color: colors.primary }]}>
          Les Ailes{" "}
          <Text style={{ color: "#1976D2" }}>de Bride</Text>
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  logoArea: {
    marginBottom: 4,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
});
