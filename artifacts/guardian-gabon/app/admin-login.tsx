import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
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
  const isWeb = Platform.OS === "web";

  const [tapCount, setTapCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  if (isAdmin) {
    router.replace("/admin-dashboard");
    return null;
  }

  const animateTap = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
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

  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: bottomPad + 40 }]}>
      <View style={styles.content}>

        {/* Logo principal — taper 10 fois silencieusement */}
        <TouchableOpacity
          onPress={handleLogoTap}
          activeOpacity={1}
          style={styles.logoArea}
        >
          <Animated.View
            style={[
              styles.logoWrap,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Feather name="shield" size={52} color="#ffffff" />
          </Animated.View>
        </TouchableOpacity>

        <Text style={[styles.appName, { color: colors.primary }]}>VoixEnfance</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Espace Administrateur
        </Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Accès réservé aux autorités habilitées
        </Text>

      </View>

      <View style={[styles.warningBox, { backgroundColor: "#fefce8", borderColor: "#fef08a", marginHorizontal: 24 }]}>
        <Feather name="alert-triangle" size={13} color="#a16207" />
        <Text style={[styles.warningText, { color: "#a16207" }]}>
          Toute tentative d'accès non autorisé est punissable par la loi.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  logoArea: {
    marginBottom: 8,
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    fontWeight: "500",
  },
});
